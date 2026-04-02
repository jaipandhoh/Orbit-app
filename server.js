// PR Campaign Manager - Express Server
import express from "express";
import pool from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import workspacesRouter from "./routes/workspaces.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

let campaigns = [];
let posts = [];

// MySQL DATETIME does not accept ISO strings like "2026-01-29T22:59:47.926Z".
// Convert common client ISO formats into a JS Date (mysql2 will serialize it).
const toMysqlDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// MySQL DATE should be sent as YYYY-MM-DD (or null).
const toMysqlDateOnly = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  if (typeof value === "string") {
    // Accept ISO or YYYY-MM-DD; normalize to YYYY-MM-DD
    return value.includes("T") ? value.split("T")[0] : value.slice(0, 10);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

async function ensureSchema() {
  // Non-destructive: creates tables if missing (PostgreSQL-compatible syntax).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS campaign_plans (
      campaign_id INT PRIMARY KEY,
      brief_text TEXT NULL,
      colors_json JSON NULL,
      plan_json JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS approvals (
      id SERIAL PRIMARY KEY,
      post_id INT NULL,
      request_id INT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      feedback TEXT NULL,
      submitted_by VARCHAR(100) NULL,
      reviewed_by VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
      FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS approval_comments (
      id SERIAL PRIMARY KEY,
      request_id INT NOT NULL,
      body TEXT NOT NULL,
      author_name VARCHAR(255) NULL,
      pin_x FLOAT NULL,
      pin_y FLOAT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
    )
  `);
  // Migrate: add source column to requests (internal vs external submissions)
  await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS source VARCHAR(32) NOT NULL DEFAULT 'internal'`).catch(() => {});
  // Migrate: add updated_at column to requests
  await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`).catch(() => {});
  // Migrate: add author_name column to approval_comments
  await pool.query(`ALTER TABLE approval_comments ADD COLUMN IF NOT EXISTS author_name VARCHAR(255) NULL`).catch(() => {});
  // Migrate: add workspace_id column to requests
  await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`).catch((e) => console.log('workspace_id migration error:', e));
}

function extractJsonFromText(text) {
  if (!text) return null;
  // Try fenced ```json blocks first
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : text;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return candidate.slice(firstBrace, lastBrace + 1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Workspace routes (auth required — see middleware/authMiddleware.js)
app.use('/api/workspaces', workspacesRouter);

// Serve static files from dist (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve public request form page
app.get('/request', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'request-form.html'));
});

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'PR Campaign Manager API is running' });
});

// Database health check
app.get("/api/health/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS db_ok");
    res.json({ status: "connected", result: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ===== CAMPAIGN PLANNING (brief + plan storage) =====
app.get("/api/campaigns/:id/plan", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM campaign_plans WHERE campaign_id = ?",
      [req.params.id]
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error("Error fetching campaign plan:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/campaigns/:id/plan", async (req, res) => {
  try {
    const { brief_text, colors_json, plan_json } = req.body || {};
    const campaignId = Number(req.params.id);
    if (!campaignId) return res.status(400).json({ error: "Invalid campaign_id" });

    await pool.execute(
      `INSERT INTO campaign_plans (campaign_id, brief_text, colors_json, plan_json)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (campaign_id) DO UPDATE SET
         brief_text = EXCLUDED.brief_text,
         colors_json = EXCLUDED.colors_json,
         plan_json = EXCLUDED.plan_json`,
      [
        campaignId,
        brief_text || null,
        colors_json ? JSON.stringify(colors_json) : null,
        plan_json ? JSON.stringify(plan_json) : null,
      ]
    );

    const [rows] = await pool.execute(
      "SELECT * FROM campaign_plans WHERE campaign_id = ?",
      [campaignId]
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error("Error saving campaign plan:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== GEMINI (server-side proxy) =====
app.post("/api/ai/campaign-plan", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not set on the server." });
    }

    const {
      name,
      objective,
      start_date,
      end_date,
      status,
      colors,
      brief,
      audience,
      channels,
      notes,
    } = req.body || {};

    const prompt = `
You are an expert PR/Comms strategist. Generate a campaign plan as STRICT JSON ONLY (no commentary).

Context:
- Campaign name: ${name || ""}
- Objective: ${objective || ""}
- Dates: ${start_date || ""} to ${end_date || ""}
- Status: ${status || "planning"}
- Brand/Campaign colors: ${colors ? JSON.stringify(colors) : "none"}
- Audience: ${audience || ""}
- Channels: ${channels || ""}
- Brief/ideas dump: ${brief || ""}
- Extra notes: ${notes || ""}

Return JSON with this shape:
{
  "overview": { "campaign_name": string, "objective": string, "audience": string, "channels": string, "success_metrics": string[] },
  "stages": [{ "name": string, "goal": string }],
  "deliverables": [
    {
      "deliverable_type": "post" | "photo" | "graphic" | "video" | "email" | "press_note" | "flyer" | "web_update" | "partnership_outreach" | "other",
      "title": string,
      "description": string,
      "stage": string,
      "platform": string | null,
      "owner_role": string | null,
      "priority": "high" | "medium" | "low",
      "due_offset_days": number
    }
  ],
  "suggested_posts": [
    { "platform": string, "content": string, "due_offset_days": number, "stage": string, "owner_role": string | null, "priority": "high"|"medium"|"low" }
  ],
  "messaging": { "pillars": string[], "cta_library": string[] }
}
    `.trim();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_MODEL
    )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return res.status(500).json({ error: `Gemini request failed: ${response.status} ${response.statusText}`, details: errText });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonText = extractJsonFromText(text);
    if (!jsonText) {
      return res.json({ raw: text });
    }
    try {
      const parsed = JSON.parse(jsonText);
      return res.json({ plan: parsed });
    } catch {
      return res.json({ raw: text });
    }
  } catch (error) {
    console.error("Error generating campaign plan:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== SHARED GEMINI HELPER =====
async function callGemini(prompt, { jsonMode = false, temperature = 0.7 } = {}) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set on the server.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 8192,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

function describeVibe(vibe) {
  const desc = (val, low, high) =>
    val <= 30 ? `very ${low}` : val <= 45 ? low : val <= 55 ? `balanced between ${low} and ${high}` : val <= 70 ? high : `very ${high}`;
  return [
    `Tone: ${desc(vibe.serious, "serious/professional", "playful/fun")}`,
    `Energy: ${desc(vibe.bold, "minimal/understated", "bold/high-impact")}`,
    `Voice: ${desc(vibe.corporate, "corporate/formal", "student/casual")}`,
  ].join(". ");
}

// ===== AI: FULL CAMPAIGN CONTENT GENERATION =====
app.post("/api/ai/campaign-generate", async (req, res) => {
  try {
    const { name, goal, audience, platforms, vibe, startDate, endDate, postsPerWeek, reelsPerWeek, mustInclude, cta, brief } = req.body || {};
    const activePlatforms = Object.entries(platforms || {}).filter(([, v]) => v).map(([k]) => k);
    if (activePlatforms.length === 0) return res.status(400).json({ error: "Select at least one platform." });

    const vibeDesc = describeVibe(vibe || { serious: 50, bold: 50, corporate: 50 });

    const prompt = `You are an elite social media strategist specializing in campaigns for nonprofits, advocacy organizations, student groups, and brand marketing. You have deep platform-specific expertise.

CAMPAIGN BRIEF:
- Campaign name: "${name || "Untitled Campaign"}"
- Primary goal: ${goal || "awareness"} (${goal === "awareness" ? "maximize reach, impressions, brand recognition" :
        goal === "signups" ? "drive registrations, conversions, email captures" :
          goal === "event" ? "maximize event attendance and pre-event buzz" :
            goal === "donations" ? "drive fundraising, donor cultivation, giving" :
              "general engagement"
      })
- Target audience: ${audience || "general audience"}
- Active platforms: ${activePlatforms.join(", ")}
- Campaign dates: ${startDate || "TBD"} to ${endDate || "TBD"} (4-week plan)
- Content cadence: ~${postsPerWeek || 3} posts/week, ~${reelsPerWeek || 1} reels or videos/week per platform
- Campaign vibe: ${vibeDesc}
- Call to action: ${cta || "Take action"}
- Must include: ${mustInclude || "nothing specific"}
- Additional brief/ideas: ${brief || "none"}

PLATFORM EXPERTISE TO APPLY:
${activePlatforms.includes("IG") ? `- Instagram: Use carousels for education (10-slide max), Reels for hooks & trends (7-15 sec), Stories for polls/engagement, static posts for impact statements. Best times: 10am, 12pm, 5-7pm. Use 15-20 hashtags.` : ""}
${activePlatforms.includes("TikTok") ? `- TikTok: Lead every video with a 1-2 second hook. Use trending formats (GRWM, Day in My Life, POV, Storytime). Keep 15-60 seconds. Best times: 6-9pm. Use 3-5 hashtags. Conversational tone.` : ""}
${activePlatforms.includes("X") ? `- X/Twitter: Threads for education (4-6 tweets), single tweets for urgency/CTAs. Use data points, punchy lines. Best times: 9am, 12pm, 5pm. Use 2-3 hashtags.` : ""}
${activePlatforms.includes("LinkedIn") ? `- LinkedIn: Professional thought leadership, data-driven posts, personal storytelling. Long-form articles for deep dives. Best times: 8-10am Tue-Thu. Use 3-5 hashtags.` : ""}

YOUR TASK: Generate a full 4-week campaign plan. Return STRICT JSON (no markdown, no commentary) with this EXACT shape:

{
  "vibeAnalysis": "2-3 sentence analysis of the campaign and recommended vibe adjustments",
  "recommendedVibe": { "serious": <0-100>, "bold": <0-100>, "corporate": <0-100> },
  "pillars": [
    { "id": 1, "name": "<pillar name>", "emoji": "<single emoji>", "posts": <number of posts for this pillar> }
  ],
  "voice": {
    "tone": "<2-3 word tone description>",
    "rules": ["<writing rule 1>", "<writing rule 2>", "<writing rule 3>"],
    "bannedPhrases": ["<phrase to avoid 1>", "<phrase to avoid 2>"],
    "emojiLevel": "<description like 'Heavy (3-5 per post)' or 'Light (1 per post)'>"
  },
  "contentCards": [
    {
      "platform": "<IG|TikTok|X|LinkedIn>",
      "type": "<carousel|reel|story|post|video|thread|article>",
      "pillar": "<must match a pillar name above>",
      "title": "<short catchy title>",
      "caption": "<full post caption for static posts/carousels/stories>",
      "script": "<full video script with HOOK, BODY, CTA for reels/videos>",
      "content": "<full text content for threads/articles>",
      "hashtags": "<relevant hashtags as a string>",
      "week": <1-4>,
      "day": "<Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday>",
      "time": "<posting time like '10:00 AM'>",
      "notes": "<production tips, design advice, strategy notes>",
      "assetChecklist": ["<asset needed 1>", "<asset needed 2>"]
    }
  ]
}

RULES:
- Use ONLY "caption" for static posts, carousels, stories. Use ONLY "script" for reels and videos. Use ONLY "content" for threads and articles. Each card should have exactly ONE of these three fields (not multiple).
- Generate 3-5 content cards per platform per week (matching the cadence).
- Spread content evenly across weeks 1-4. Week 1 = launch/tease, Week 2 = build momentum, Week 3 = peak push, Week 4 = event/payoff + wrap-up.
- Make all content SPECIFIC to the campaign brief - no generic placeholders. Write real captions, scripts, and content.
- Every script must include a compelling HOOK (first 1-2 seconds), then body content, then a clear CTA.
- Include 3-5 content pillars that match the campaign goal.
- Posting times should be optimal for each platform and audience.
- Asset checklists should be specific and actionable.
- Notes should include production tips, design guidance, and strategic reasoning.
${mustInclude ? `- MUST weave in: "${mustInclude}"` : ""}
${cta ? `- Primary CTA across all content: "${cta}"` : ""}`;

    const text = await callGemini(prompt, { jsonMode: true, temperature: 0.75 });
    const jsonText = extractJsonFromText(text);

    if (!jsonText) return res.json({ raw: text });
    try {
      const parsed = JSON.parse(jsonText);
      // Assign sequential IDs to content cards
      if (parsed.contentCards) {
        parsed.contentCards = parsed.contentCards.map((c, i) => ({ ...c, id: i + 1 }));
      }
      return res.json({ plan: parsed });
    } catch {
      return res.json({ raw: text });
    }
  } catch (error) {
    console.error("Error generating campaign:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== AI: COLOR PALETTE GENERATION =====
app.post("/api/ai/campaign-palettes", async (req, res) => {
  try {
    const { name, goal, audience, vibe } = req.body || {};
    const vibeDesc = describeVibe(vibe || { serious: 50, bold: 50, corporate: 50 });

    const prompt = `You are an expert brand designer and color psychologist for social media campaigns.

CAMPAIGN CONTEXT:
- Campaign: "${name || "Untitled"}"
- Goal: ${goal || "awareness"}
- Audience: ${audience || "general"}
- Vibe: ${vibeDesc}

Generate exactly 3 unique color palettes. Each should evoke a different emotion while being appropriate for the campaign. Consider:
- Color psychology (urgency=reds/oranges, trust=blues, growth=greens, energy=yellows)
- Accessibility (sufficient contrast, works on light and dark backgrounds)
- Social media aesthetics (colors that pop on feeds, look good on mobile)
- Audience appeal (students prefer vibrant/bold, corporate prefers muted/professional)

Return STRICT JSON with this shape:
{
  "palettes": [
    {
      "id": 1,
      "name": "<creative 2-word palette name>",
      "colors": ["<hex1>", "<hex2>", "<hex3>", "<hex4>", "<hex5>"],
      "gradient": "linear-gradient(135deg, <hex1>, <hex2>)",
      "vibe": "<1 sentence describing the emotional feel>"
    }
  ]
}

RULES:
- 5 colors per palette: primary, secondary, accent, light, lightest
- First two colors are the gradient pair (strongest, most defining)
- Colors must work together harmoniously
- Each palette should feel distinctly different
- Names should be evocative and memorable (e.g., "Civic Neon", "Ocean Rally", "Sunset March")`;

    const text = await callGemini(prompt, { jsonMode: true, temperature: 0.85 });
    const jsonText = extractJsonFromText(text);

    if (!jsonText) return res.json({ palettes: [] });
    try {
      const parsed = JSON.parse(jsonText);
      return res.json({ palettes: parsed.palettes || [] });
    } catch {
      return res.json({ palettes: [] });
    }
  } catch (error) {
    console.error("Error generating palettes:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== AI: CAPTION BANK GENERATION =====
app.post("/api/ai/campaign-captions", async (req, res) => {
  try {
    const { name, goal, audience, platforms, vibe, cta, mustInclude } = req.body || {};
    const activePlatforms = Object.entries(platforms || {}).filter(([, v]) => v).map(([k]) => k);
    const vibeDesc = describeVibe(vibe || { serious: 50, bold: 50, corporate: 50 });

    const prompt = `You are a world-class social media copywriter. Generate a caption bank for a campaign.

CONTEXT:
- Campaign: "${name || "Untitled"}"
- Goal: ${goal || "awareness"}
- Audience: ${audience || "general"}
- Platforms: ${activePlatforms.join(", ") || "Instagram"}
- Vibe: ${vibeDesc}
- CTA: ${cta || "Take action"}
${mustInclude ? `- Must weave in: "${mustInclude}"` : ""}

Return STRICT JSON:
{
  "captionBank": {
    "short": [
      { "text": "<1-2 line caption>", "bestFor": "<platform or use case>" }
    ],
    "medium": [
      { "text": "<3-4 line caption with line breaks>", "bestFor": "<platform or use case>" }
    ],
    "long": [
      { "text": "<5-8 line storytelling caption>", "bestFor": "<platform or use case>" }
    ],
    "hooks": [
      { "text": "<attention-grabbing first line>", "bestFor": "<reels, tiktok, etc>" }
    ],
    "ctas": [
      { "text": "<call to action line>", "bestFor": "<context>" }
    ]
  },
  "summary": "<1 sentence about the caption strategy>"
}

RULES:
- Generate 4-5 captions per category (short, medium, long, hooks, ctas)
- Write for the specific audience and vibe - not generic
- Hooks should stop the scroll in under 2 seconds
- CTAs should create urgency without being pushy
- Medium captions should use line breaks strategically
- Long captions should tell micro-stories
- Include platform-specific formatting (e.g., line spacing for IG, brevity for X)
- Make each caption actually usable - not a template with [brackets]`;

    const text = await callGemini(prompt, { jsonMode: true, temperature: 0.9 });
    const jsonText = extractJsonFromText(text);

    if (!jsonText) return res.json({ raw: text });
    try {
      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    } catch {
      return res.json({ raw: text });
    }
  } catch (error) {
    console.error("Error generating captions:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== AI: COPILOT CHAT =====
app.post("/api/ai/campaign-chat", async (req, res) => {
  try {
    const { messages, campaignContext } = req.body || {};
    const ctx = campaignContext || {};
    const activePlatforms = Object.entries(ctx.platforms || {}).filter(([, v]) => v).map(([k]) => k);
    const vibeDesc = ctx.vibe ? describeVibe(ctx.vibe) : "balanced";

    // Build conversation history
    const conversationHistory = (messages || [])
      .map(m => `${m.role === "user" ? "User" : "AI Copilot"}: ${m.content}`)
      .join("\n\n");

    const prompt = `You are an AI campaign planning copilot inside a social media campaign management tool called Orbit. You help PR teams, nonprofit communicators, and student organizers plan and execute campaigns.

YOUR EXPERTISE:
- Social media strategy across Instagram, TikTok, X/Twitter, LinkedIn
- Content calendar planning and optimization
- Copywriting for different platforms and audiences
- Campaign psychology: urgency, social proof, storytelling
- Brand voice development and consistency
- Hashtag strategy and trending content
- Video scripting (hooks, pacing, CTAs)
- Analytics interpretation and optimization

CURRENT CAMPAIGN CONTEXT:
- Name: ${ctx.name || "not set yet"}
- Goal: ${ctx.goal || "not set"}
- Audience: ${ctx.audience || "not set"}
- Platforms: ${activePlatforms.join(", ") || "none selected"}
- Vibe: ${vibeDesc}
- Dates: ${ctx.startDate || "TBD"} to ${ctx.endDate || "TBD"}
- CTA: ${ctx.cta || "not set"}
- Must include: ${ctx.mustInclude || "nothing specific"}
- Brief: ${ctx.brief || "none"}
- Content generated: ${ctx.contentCount || 0} pieces
- Palette selected: ${ctx.paletteName || "none"}

CONVERSATION SO FAR:
${conversationHistory || "No messages yet."}

RULES:
- Be concise but specific (2-4 paragraphs max)
- Give actionable advice, not generic tips
- Reference the specific campaign details when relevant
- If asked to generate content, write actual copy (not templates with [brackets])
- If the user's request is unclear, ask ONE specific clarifying question
- Use bullet points and line breaks for readability
- When suggesting improvements, explain WHY
- You can suggest changes to the vibe sliders, platform selection, or posting schedule
- Be encouraging and collaborative, not lecturing

Respond to the latest message:`;

    const text = await callGemini(prompt, { jsonMode: false, temperature: 0.7 });
    return res.json({ reply: text.trim() });
  } catch (error) {
    console.error("Error in campaign chat:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== CAMPAIGNS ROUTES =====

// Get all campaigns
app.get("/api/campaigns", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM campaigns ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get single campaign
app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM campaigns WHERE campaign_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create campaign
app.post("/api/campaigns", async (req, res) => {
  const { title, objective, start_date, end_date, status } = req.body;

  if (!title || !start_date || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO campaigns (title, objective, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [title, objective, start_date, end_date || null, status]
    );

    const [rows] = await pool.query(
      "SELECT * FROM campaigns WHERE campaign_id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update campaign
app.put('/api/campaigns/:id', async (req, res) => {
  try {
    const { contact_id, title, objective, start_date, end_date, status } = req.body;

    const [result] = await pool.execute(
      `UPDATE campaigns 
             SET contact_id = ?, title = ?, objective = ?, start_date = ?, end_date = ?, status = ?
             WHERE campaign_id = ?`,
      [contact_id || null, title, objective || null, start_date, end_date || null, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const [updatedCampaign] = await pool.execute(
      'SELECT * FROM campaigns WHERE campaign_id = ?',
      [req.params.id]
    );

    res.json(updatedCampaign[0]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete campaign
app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM campaigns WHERE campaign_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== DELIVERABLES ROUTES =====

// Get all deliverables
app.get('/api/deliverables', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM deliverables ORDER BY due_date ASC, priority DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get deliverables by campaign
app.get('/api/deliverables/campaign/:campaign_id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM deliverables WHERE campaign_id = ? ORDER BY due_date ASC, priority DESC',
      [req.params.campaign_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create deliverable
app.post('/api/deliverables', async (req, res) => {
  try {
    const {
      campaign_id,
      deliverable_type,
      stage,
      platform,
      title,
      description,
      due_date,
      priority,
      owner_role,
      status
    } = req.body;

    if (!campaign_id || !deliverable_type || !title) {
      return res.status(400).json({ error: 'campaign_id, deliverable_type, and title are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO deliverables (campaign_id, deliverable_type, stage, platform, title, description, due_date, priority, owner_role, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campaign_id,
        deliverable_type,
        stage || null,
        platform || null,
        title,
        description || null,
        toMysqlDateOnly(due_date),
        priority || 'medium',
        owner_role || null,
        status || 'planned'
      ]
    );

    const [newDeliverable] = await pool.execute(
      'SELECT * FROM deliverables WHERE deliverable_id = ?',
      [result.insertId]
    );

    res.status(201).json(newDeliverable[0]);
  } catch (error) {
    console.error('Error creating deliverable:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update deliverable
app.patch('/api/deliverables/:id', async (req, res) => {
  try {
    const fields = [
      'deliverable_type',
      'stage',
      'platform',
      'title',
      'description',
      'due_date',
      'priority',
      'owner_role',
      'status',
    ];

    const updateFields = [];
    const params = [];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updateFields.push(`${f} = ?`);
        if (f === 'due_date') {
          params.push(toMysqlDateOnly(req.body[f]));
        } else {
          params.push(req.body[f]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    const [result] = await pool.execute(
      `UPDATE deliverables SET ${updateFields.join(', ')} WHERE deliverable_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM deliverables WHERE deliverable_id = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating deliverable:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete deliverable
app.delete('/api/deliverables/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM deliverables WHERE deliverable_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting deliverable:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== POSTS ROUTES =====

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM posts ORDER BY published_at DESC, scheduled_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM posts WHERE post_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create post
app.post('/api/posts', async (req, res) => {
  try {
    const { campaign_id, platform, content, scheduled_at, published_at, impressions, clicks } = req.body;

    if (!campaign_id || !platform || !content) {
      return res.status(400).json({ error: 'campaign_id, platform, and content are required' });
    }

    const scheduledAt = toMysqlDate(scheduled_at);
    const publishedAt = toMysqlDate(published_at);

    const [result] = await pool.execute(
      `INSERT INTO posts (campaign_id, platform, content, scheduled_at, published_at, impressions, clicks)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        campaign_id,
        platform,
        content,
        scheduledAt,
        publishedAt,
        impressions || 0,
        clicks || 0
      ]
    );

    const [newPost] = await pool.execute(
      'SELECT * FROM posts WHERE post_id = ?',
      [result.insertId]
    );

    res.status(201).json(newPost[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { campaign_id, platform, content, scheduled_at, published_at, impressions, clicks } = req.body;

    const scheduledAt = toMysqlDate(scheduled_at);
    const publishedAt = toMysqlDate(published_at);

    const [result] = await pool.execute(
      `UPDATE posts 
             SET campaign_id = ?, platform = ?, content = ?, scheduled_at = ?, published_at = ?, impressions = ?, clicks = ?
             WHERE post_id = ?`,
      [
        campaign_id,
        platform,
        content,
        scheduledAt,
        publishedAt,
        impressions || 0,
        clicks || 0,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [updatedPost] = await pool.execute(
      'SELECT * FROM posts WHERE post_id = ?',
      [req.params.id]
    );

    res.json(updatedPost[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM posts WHERE post_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== REQUESTS ROUTES =====

// Get all users (for owner assignment dropdowns)
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT user_id, name, email, role FROM users ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all departments
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT department_id, name FROM departments ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const { status, platform, priority, ownerUserId, campaignId, departmentId, deadlineFrom, deadlineTo, search, source, workspaceId } = req.query;

    let query = `
      SELECT r.*,
        requester.name AS requester_name,
        requester.email AS requester_email,
        owner_user.name AS owner_name,
        d.name AS department_name
      FROM requests r
      LEFT JOIN users requester ON r.requester_user_id = requester.user_id
      LEFT JOIN users owner_user ON r.owner_user_id = owner_user.user_id
      LEFT JOIN departments d ON r.department_id = d.department_id
      WHERE 1=1
    `;
    const params = [];

    if (workspaceId) {
      query += ' AND r.workspace_id = ?';
      params.push(workspaceId);
    }

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    if (platform) {
      query += ' AND r.platform = ?';
      params.push(platform);
    }
    if (priority) {
      query += ' AND r.priority = ?';
      params.push(priority);
    }
    if (ownerUserId) {
      query += ' AND r.owner_user_id = ?';
      params.push(ownerUserId);
    }
    if (campaignId) {
      query += ' AND r.campaign_id = ?';
      params.push(campaignId);
    }
    if (departmentId) {
      query += ' AND r.department_id = ?';
      params.push(departmentId);
    }
    if (deadlineFrom) {
      query += ' AND r.deadline_at >= ?';
      params.push(deadlineFrom);
    }
    if (deadlineTo) {
      query += ' AND r.deadline_at <= ?';
      params.push(deadlineTo);
    }
    if (source) {
      query += ' AND r.source = ?';
      params.push(source);
    }
    if (search) {
      query += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY r.deadline_at ASC, r.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single request
app.get('/api/requests/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*,
        requester.name AS requester_name,
        requester.email AS requester_email,
        owner_user.name AS owner_name,
        d.name AS department_name
      FROM requests r
      LEFT JOIN users requester ON r.requester_user_id = requester.user_id
      LEFT JOIN users owner_user ON r.owner_user_id = owner_user.user_id
      LEFT JOIN departments d ON r.department_id = d.department_id
      WHERE r.request_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create request (internal)
app.post('/api/requests', async (req, res) => {
  try {
    const { title, description, department_id, campaign_id, platform, content_type, priority, deadline_at, owner_user_id, workspace_id } = req.body;

    if (!title || !platform || !content_type) {
      return res.status(400).json({ error: 'title, platform, and content_type are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO requests (title, description, department_id, campaign_id, platform, content_type, priority, deadline_at, status, owner_user_id, source, workspace_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 'internal', ?)`,
      [
        title,
        description || null,
        department_id || null,
        campaign_id || null,
        platform,
        content_type,
        priority || 'normal',
        toMysqlDate(deadline_at),
        owner_user_id || null,
        workspace_id || null,
      ]
    );

    const [newRequest] = await pool.execute(
      `SELECT r.*,
        requester.name AS requester_name, requester.email AS requester_email,
        owner_user.name AS owner_name, d.name AS department_name
      FROM requests r
      LEFT JOIN users requester ON r.requester_user_id = requester.user_id
      LEFT JOIN users owner_user ON r.owner_user_id = owner_user.user_id
      LEFT JOIN departments d ON r.department_id = d.department_id
      WHERE r.request_id = ?`,
      [result.insertId]
    );

    res.status(201).json(newRequest[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public request submission endpoint (handles department and user creation)
app.post('/api/requests/public', async (req, res) => {
  try {
    const { title, description, platform, content_type, priority, deadline_at, requester_name, requester_email, department_name, workspace_id } = req.body;

    if (!title || !platform || !content_type || !requester_name || !requester_email || !department_name) {
      return res.status(400).json({ error: 'title, platform, content_type, requester_name, requester_email, and department_name are required' });
    }

    // Find or create department
    let [departments] = await pool.execute(
      'SELECT department_id FROM departments WHERE name = ?',
      [department_name]
    );

    let departmentId;
    if (departments.length > 0) {
      departmentId = departments[0].department_id;
    } else {
      const [deptResult] = await pool.execute(
        'INSERT INTO departments (name) VALUES (?)',
        [department_name]
      );
      departmentId = deptResult.insertId;
    }

    // Find or create requester user
    let [users] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [requester_email]
    );

    let requesterUserId;
    if (users.length > 0) {
      requesterUserId = users[0].user_id;
      // Update name in case it changed
      await pool.execute(
        'UPDATE users SET name = ? WHERE user_id = ?',
        [requester_name, requesterUserId]
      );
    } else {
      const [userResult] = await pool.execute(
        'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
        [requester_name, requester_email, 'requester']
      );
      requesterUserId = userResult.insertId;
    }

    // Create the request
    const [result] = await pool.execute(
      `INSERT INTO requests (title, description, department_id, platform, content_type, priority, deadline_at, status, requester_user_id, source, workspace_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, 'external', ?)`,
      [
        title,
        description || null,
        departmentId,
        platform,
        content_type,
        priority || 'normal',
        toMysqlDate(deadline_at),
        requesterUserId,
        workspace_id || null,
      ]
    );

    const [newRequest] = await pool.execute(
      `SELECT r.*,
        requester.name AS requester_name, requester.email AS requester_email,
        owner_user.name AS owner_name, d.name AS department_name
      FROM requests r
      LEFT JOIN users requester ON r.requester_user_id = requester.user_id
      LEFT JOIN users owner_user ON r.owner_user_id = owner_user.user_id
      LEFT JOIN departments d ON r.department_id = d.department_id
      WHERE r.request_id = ?`,
      [result.insertId]
    );

    res.status(201).json(newRequest[0]);
  } catch (error) {
    console.error('Error creating public request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update request
app.patch('/api/requests/:id', async (req, res) => {
  try {
    const { title, description, priority, status, deadline_at, scheduled_at, owner_user_id, campaign_id, platform, content_type, department_id } = req.body;

    const updateFields = [];
    const params = [];

    if (title !== undefined) { updateFields.push('title = ?'); params.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); params.push(description); }
    if (priority !== undefined) { updateFields.push('priority = ?'); params.push(priority); }
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    if (platform !== undefined) { updateFields.push('platform = ?'); params.push(platform); }
    if (content_type !== undefined) { updateFields.push('content_type = ?'); params.push(content_type); }
    if (deadline_at !== undefined) { updateFields.push('deadline_at = ?'); params.push(toMysqlDate(deadline_at)); }
    if (scheduled_at !== undefined) { updateFields.push('scheduled_at = ?'); params.push(toMysqlDate(scheduled_at)); }
    if (owner_user_id !== undefined) { updateFields.push('owner_user_id = ?'); params.push(owner_user_id || null); }
    if (campaign_id !== undefined) { updateFields.push('campaign_id = ?'); params.push(campaign_id || null); }
    if (department_id !== undefined) { updateFields.push('department_id = ?'); params.push(department_id || null); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    const [result] = await pool.execute(
      `UPDATE requests SET ${updateFields.join(', ')} WHERE request_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const [updatedRequest] = await pool.execute(
      `SELECT r.*,
        requester.name AS requester_name, requester.email AS requester_email,
        owner_user.name AS owner_name, d.name AS department_name
      FROM requests r
      LEFT JOIN users requester ON r.requester_user_id = requester.user_id
      LEFT JOIN users owner_user ON r.owner_user_id = owner_user.user_id
      LEFT JOIN departments d ON r.department_id = d.department_id
      WHERE r.request_id = ?`,
      [req.params.id]
    );

    res.json(updatedRequest[0]);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit request for approval
app.post('/api/requests/:id/submit-for-approval', async (req, res) => {
  try {
    const [result] = await pool.execute(
      `UPDATE requests SET status = 'in_review' WHERE request_id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const row = await fetchRequestWithJoins(req.params.id);
    res.json(row);
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== APPROVAL RULES ROUTES =====

// Get all approval rules
app.get('/api/approval-rules', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM approval_rules WHERE is_active = true ORDER BY priority_order ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching approval rules:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create approval rule
app.post('/api/approval-rules', async (req, res) => {
  try {
    const {
      name, description, rule_type, condition_platform, condition_content_type,
      condition_priority, condition_campaign_id, stages_json, auto_approve_enabled,
      auto_approve_conditions_json, emergency_bypass_enabled, emergency_bypass_roles_json,
      priority_order, is_active
    } = req.body;

    if (!name || !rule_type) {
      return res.status(400).json({ error: 'name and rule_type are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO approval_rules (
                name, description, rule_type, condition_platform, condition_content_type,
                condition_priority, condition_campaign_id, stages_json, auto_approve_enabled,
                auto_approve_conditions_json, emergency_bypass_enabled, emergency_bypass_roles_json,
                priority_order, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description || null, rule_type, condition_platform || null,
        condition_content_type || null, condition_priority || null,
        condition_campaign_id || null, stages_json ? JSON.stringify(stages_json) : null,
        auto_approve_enabled || false,
        auto_approve_conditions_json ? JSON.stringify(auto_approve_conditions_json) : null,
        emergency_bypass_enabled || false,
        emergency_bypass_roles_json ? JSON.stringify(emergency_bypass_roles_json) : null,
        priority_order || 100, is_active !== undefined ? is_active : true
      ]
    );

    const [newRule] = await pool.execute(
      'SELECT * FROM approval_rules WHERE rule_id = ?',
      [result.insertId]
    );

    res.status(201).json(newRule[0]);
  } catch (error) {
    console.error('Error creating approval rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update approval rule
app.patch('/api/approval-rules/:id', async (req, res) => {
  try {
    const updateFields = [];
    const params = [];
    const fields = [
      'name', 'description', 'rule_type', 'condition_platform', 'condition_content_type',
      'condition_priority', 'condition_campaign_id', 'stages_json', 'auto_approve_enabled',
      'auto_approve_conditions_json', 'emergency_bypass_enabled', 'emergency_bypass_roles_json',
      'priority_order', 'is_active'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field.includes('_json')) {
          updateFields.push(`${field} = ?`);
          params.push(req.body[field] ? JSON.stringify(req.body[field]) : null);
        } else {
          updateFields.push(`${field} = ?`);
          params.push(req.body[field]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    const [result] = await pool.execute(
      `UPDATE approval_rules SET ${updateFields.join(', ')} WHERE rule_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    const [updatedRule] = await pool.execute(
      'SELECT * FROM approval_rules WHERE rule_id = ?',
      [req.params.id]
    );

    res.json(updatedRule[0]);
  } catch (error) {
    console.error('Error updating approval rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete approval rule
app.delete('/api/approval-rules/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM approval_rules WHERE rule_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting approval rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ONBOARDING TEMPLATES ROUTES =====

// Get all onboarding templates
app.get('/api/onboarding-templates', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM onboarding_templates WHERE is_active = true'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching onboarding templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply onboarding template
app.post('/api/onboarding-templates/:id/apply', async (req, res) => {
  try {
    const [template] = await pool.execute(
      'SELECT * FROM onboarding_templates WHERE template_id = ?',
      [req.params.id]
    );

    if (template.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Update team settings
    const [settings] = await pool.execute('SELECT * FROM team_settings LIMIT 1');
    if (settings.length === 0) {
      await pool.execute(
        'INSERT INTO team_settings (onboarding_template_id) VALUES (?)',
        [req.params.id]
      );
    } else {
      await pool.execute(
        'UPDATE team_settings SET onboarding_template_id = ?',
        [req.params.id]
      );
    }

    res.json({ success: true, template: template[0] });
  } catch (error) {
    console.error('Error applying template:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== CONTACTS ROUTES =====

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create contact
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, organization } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO contacts (name, email, organization) VALUES (?, ?, ?)',
      [name, email, organization || null]
    );

    const [newContact] = await pool.execute(
      'SELECT * FROM contacts WHERE contact_id = ?',
      [result.insertId]
    );

    res.status(201).json(newContact[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { name, email, organization } = req.body;

    const [result] = await pool.execute(
      'UPDATE contacts SET name = ?, email = ?, organization = ? WHERE contact_id = ?',
      [name, email, organization || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const [updatedContact] = await pool.execute(
      'SELECT * FROM contacts WHERE contact_id = ?',
      [req.params.id]
    );

    res.json(updatedContact[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM contacts WHERE contact_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== REPORTS ROUTES =====

// Campaign summary (view-based) - matches frontend expectation
app.get('/api/reports/campaign-summary', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
            SELECT * FROM v_campaign_summary
            ORDER BY campaign_id DESC
        `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching campaign summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Campaign post summary (alternative endpoint name)
app.get('/api/reports/campaign_post_summary', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
            SELECT * FROM v_campaign_summary
            ORDER BY campaign_id DESC
        `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching campaign post summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Posts with campaign info (JOIN report)
app.get('/api/reports/posts-with-campaign', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
            SELECT 
                p.post_id,
                p.content,
                p.platform,
                p.impressions,
                p.clicks,
                c.campaign_id,
                c.title AS campaign_title,
                c.status AS status,
                ct.contact_id,
                ct.name AS contact_name,
                ct.email AS contact_email
            FROM posts p
            LEFT JOIN campaigns c ON p.campaign_id = c.campaign_id
            LEFT JOIN contacts ct ON c.contact_id = ct.contact_id
            ORDER BY p.published_at DESC, p.scheduled_at DESC
        `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts with campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Campaign detail (stored procedure)
app.get('/api/reports/campaign-summary/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'CALL sp_get_campaign_summary(?)',
      [req.params.id]
    );
    // Stored procedures in mysql2 return results in an array
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching campaign detail:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== APPROVALS =====
app.post('/api/approvals/:id/request', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { submitted_by, type = 'post' } = req.body;

    // Determine the column to check based on the type (post or request)
    const idColumn = type === 'request' ? 'request_id' : 'post_id';

    // Upsert: if a pending approval already exists for this post/request, don't create a duplicate
    const [existing] = await pool.query(
      `SELECT id FROM approvals WHERE ${idColumn} = ? AND status = 'pending'`,
      [id]
    );
    if (existing.length > 0) {
      return res.json({ id: existing[0].id, message: 'Already pending' });
    }

    if (type === 'request') {
      const [result] = await pool.query(
        `INSERT INTO approvals (request_id, status, submitted_by) VALUES (?, 'pending', ?)`,
        [id, submitted_by || null]
      );
      // Update the request status
      await pool.query(`UPDATE requests SET status = 'in_review' WHERE request_id = ?`, [id]);
      res.status(201).json({ id: result.insertId });
    } else {
      const [result] = await pool.query(
        `INSERT INTO approvals (post_id, status, submitted_by) VALUES (?, 'pending', ?)`,
        [id, submitted_by || null]
      );
      res.status(201).json({ id: result.insertId });
    }
  } catch (err) {
    console.error('Error creating approval request:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/approvals/:id/approve', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reviewed_by, type = 'post' } = req.body;
    const idColumn = type === 'request' ? 'request_id' : 'post_id';

    await pool.query(
      `UPDATE approvals SET status = 'approved', reviewed_by = ? WHERE ${idColumn} = ? AND status = 'pending'`,
      [reviewed_by || null, id]
    );

    if (type === 'request') {
      await pool.query(`UPDATE requests SET status = 'approved' WHERE request_id = ?`, [id]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error approving content:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/approvals/:id/reject', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { feedback, reviewed_by, type = 'post' } = req.body;
    if (!feedback) return res.status(400).json({ error: 'feedback is required' });

    const idColumn = type === 'request' ? 'request_id' : 'post_id';

    await pool.query(
      `UPDATE approvals SET status = 'rejected', feedback = ?, reviewed_by = ? WHERE ${idColumn} = ? AND status = 'pending'`,
      [feedback, reviewed_by || null, id]
    );

    if (type === 'request') {
      await pool.query(`UPDATE requests SET status = 'changes_requested' WHERE request_id = ?`, [id]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error rejecting content:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/approvals/pending', async (req, res) => {
  try {
    // Fetch pending approvals for Posts
    const [postRows] = await pool.query(`
      SELECT 'post' AS approval_type, a.id AS approval_id, a.post_id AS target_id, a.status, a.feedback, a.submitted_by, a.created_at,
             p.platform, p.content, p.campaign_id,
             c.title AS campaign_name
      FROM approvals a
      JOIN posts p ON a.post_id = p.post_id
      LEFT JOIN campaigns c ON p.campaign_id = c.campaign_id
      WHERE a.status = 'pending' AND a.post_id IS NOT NULL
    `);

    // Fetch pending approvals for Requests
    const [requestRows] = await pool.query(`
      SELECT 'request' AS approval_type, a.id AS approval_id, a.request_id AS target_id, a.status, a.feedback, a.submitted_by, a.created_at,
             r.platform, r.title AS content, r.campaign_id,
             c.title AS campaign_name, r.description
      FROM approvals a
      JOIN requests r ON a.request_id = r.request_id
      LEFT JOIN campaigns c ON r.campaign_id = c.campaign_id
      WHERE a.status = 'pending' AND a.request_id IS NOT NULL
    `);

    const combinedRows = [...postRows, ...requestRows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(combinedRows);
  } catch (err) {
    console.error('Error fetching pending approvals:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== REQUEST COMMENTS (STUDIO VIEW) =====
app.get('/api/requests/:id/comments', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const [rows] = await pool.query(
      'SELECT * FROM approval_comments WHERE request_id = ? ORDER BY created_at ASC',
      [requestId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching request comments:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/requests/:id/comments', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { body, pinX, pinY, author_name } = req.body;

    if (!body) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO approval_comments (request_id, body, author_name, pin_x, pin_y) VALUES (?, ?, ?, ?, ?)',
      [requestId, body, author_name || null, pinX !== undefined ? pinX : null, pinY !== undefined ? pinY : null]
    );

    const [newComment] = await pool.query(
      'SELECT * FROM approval_comments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newComment[0]);
  } catch (err) {
    console.error('Error saving request comment:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== REQUEST APPROVAL WORKFLOW =====

const fetchRequestWithJoins = async (requestId) => {
  const [rows] = await pool.execute(
    `SELECT r.*,
      requester.name AS requester_name, requester.email AS requester_email,
      owner_user.name AS owner_name, d.name AS department_name
    FROM requests r
    LEFT JOIN users requester ON r.requester_user_id = requester.user_id
    LEFT JOIN users owner_user ON r.owner_user_id = owner_user.user_id
    LEFT JOIN departments d ON r.department_id = d.department_id
    WHERE r.request_id = ?`,
    [requestId]
  );
  return rows[0] || null;
};

// Approve a request
app.post('/api/requests/:id/approve', async (req, res) => {
  try {
    const [result] = await pool.execute(
      `UPDATE requests SET status = 'approved' WHERE request_id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Request not found' });
    const row = await fetchRequestWithJoins(req.params.id);
    res.json(row);
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject / request changes on a request
app.post('/api/requests/:id/reject', async (req, res) => {
  try {
    const [result] = await pool.execute(
      `UPDATE requests SET status = 'changes_requested' WHERE request_id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Request not found' });
    const row = await fetchRequestWithJoins(req.params.id);
    res.json(row);
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== MASTER TO-DO LIST =====

app.get('/api/todo', async (req, res) => {
  try {
    const [requestRows] = await pool.execute(
      `SELECT request_id AS id, 'request' AS type, title, deadline_at AS due_date, status, priority
       FROM requests WHERE status = 'approved'`
    );
    const [deliverableRows] = await pool.execute(
      `SELECT deliverable_id AS id, 'deliverable' AS type, title, due_date, status, priority, campaign_id AS parent_campaign_id
       FROM deliverables WHERE status IN ('planned', 'in_progress')`
    );
    const [postRows] = await pool.execute(
      `SELECT post_id AS id, 'post' AS type, SUBSTRING(content, 1, 80) AS title, scheduled_at AS due_date,
              'scheduled' AS status, platform, campaign_id AS parent_campaign_id
       FROM posts WHERE published_at IS NULL`
    );

    const allItems = [...requestRows, ...deliverableRows, ...postRows];
    allItems.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

    res.json(allItems);
  } catch (error) {
    console.error('Error fetching todo list:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fallback: serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// For Vercel, we need to export the app instead of unconditionally listening
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  (async () => {
    try {
      await ensureSchema();
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
        console.log(`🌐 Frontend served from http://localhost:${PORT}/`);
      });
    } catch (err) {
      console.error("Failed to start server (schema check failed):", err);
      process.exit(1);
    }
  })();
} else {
  // In Vercel, just ensure schema asynchronously without starting a listener
  ensureSchema().catch(err => console.error("Schema check failed in serverless mode:", err));
}

export default app;
