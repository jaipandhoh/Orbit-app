import React, { useState } from 'react';
import {
  LayoutDashboard, Megaphone, Inbox, Trello, Calendar, Users,
  ListTodo, Settings, Sparkles, BookOpen, Play, ChevronDown,
  Shield, Zap,
  ArrowRight, Search, CheckCircle, Star,
} from 'lucide-react';
import { VIEWS } from '../routes.js';
import { resetTour } from '../components/OnboardingTour.jsx';

// ── Article card with optional video placeholder ──────────────────────────
const ArticleCard = ({ title, description, steps, tips, videoLabel }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border dark:border-gray-800 rounded-2xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface2 dark:hover:bg-surface2-dark transition-colors"
      >
        <span className="text-sm font-semibold text-text">{title}</span>
        <ChevronDown
          size={16}
          className={`text-mutedText shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border dark:border-gray-800">
          <p className="text-sm text-mutedText leading-relaxed pt-4">{description}</p>

          {steps && steps.length > 0 && (
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          )}

          {tips && tips.length > 0 && (
            <div className="space-y-1.5">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-primary/5 text-xs text-primary">
                  <Star size={12} className="shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          )}

          {/* Video placeholder */}
          <div className="flex items-center justify-center gap-3 py-6 rounded-2xl border-2 border-dashed border-border dark:border-gray-700 bg-surface2/50 dark:bg-surface2-dark/30">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Play size={18} className="text-primary ml-0.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">{videoLabel ?? 'Video tutorial'}</p>
              <p className="text-xs text-mutedText">Video coming soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Section component ──────────────────────────────────────────────────────
const HelpSection = ({ icon: Icon, gradient, title, children }) => (
  <section className="space-y-3">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <Icon size={17} className="text-white" />
      </div>
      <h2 className="text-base font-bold text-text">{title}</h2>
    </div>
    {children}
  </section>
);

// ── Help page ──────────────────────────────────────────────────────────────
const HelpView = ({ onNavigate, onReplayTour }) => {
  const [search, setSearch] = useState('');

  const handleReplayTour = () => {
    resetTour();
    onReplayTour?.();
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-text">Help & Tutorials</h1>
          <p className="text-mutedText">Everything you need to get the most out of Orbit.</p>
        </div>
        <button
          onClick={handleReplayTour}
          className="btn-secondary flex items-center gap-2 text-sm shrink-0"
        >
          <Play size={14} />
          Replay tour
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText pointer-events-none" />
        <input
          type="text"
          placeholder="Search help articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-control border border-border dark:border-gray-700 bg-surface2 dark:bg-surface2-dark text-sm text-text placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500 bg-blue-500/10', view: VIEWS.DASHBOARD },
          { icon: Megaphone, label: 'Campaigns', color: 'text-violet-500 bg-violet-500/10', view: VIEWS.CAMPAIGNS },
          { icon: Inbox, label: 'Inbox', color: 'text-orange-500 bg-orange-500/10', view: VIEWS.INBOX },
          { icon: Settings, label: 'Settings', color: 'text-gray-500 bg-gray-500/10', view: VIEWS.SETTINGS },
        ].map(({ icon: Icon, label, color, view }) => (
          <button
            key={label}
            onClick={() => onNavigate?.(view)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border dark:border-gray-800 hover:border-primary/40 transition-colors text-sm font-medium text-text"
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={14} />
            </span>
            {label}
            <ArrowRight size={12} className="text-mutedText ml-auto" />
          </button>
        ))}
      </div>

      {/* ── Getting Started ── */}
      <HelpSection icon={BookOpen} gradient="from-primary to-purple-500" title="Getting Started">
        <ArticleCard
          title="Setting up your workspace"
          description="Before diving in, make sure your workspace is configured with the right members and settings. You can invite teammates, set roles, and configure approval workflows from the Settings page."
          steps={[
            'Navigate to Settings using the gear icon or your avatar menu.',
            'Go to the Workspace tab to see current members.',
            'Click "Invite a member" and enter a colleague\'s email address.',
            'Share the generated invite link — it expires after 7 days.',
            'Head to the Approvals tab to configure automated approval rules for your content workflow.',
          ]}
          tips={[
            'Owners and Admins can invite members. Regular members cannot.',
            'You can configure approval rules so certain content types get auto-approved.',
          ]}
          videoLabel="Workspace setup walkthrough"
        />
        <ArticleCard
          title="Connecting Gemini AI"
          description="Orbit's AI features — campaign strategy generation, messaging pillars, audience personas, and content calendars — all require a Gemini API key."
          steps={[
            'Get a free API key from Google AI Studio (aistudio.google.com).',
            'Open your project\'s .env file.',
            'Add the line: VITE_GEMINI_API_KEY=your_key_here',
            'Restart the dev server with npm run dev:server.',
            'The Integrations tab in Settings will show "Connected" when active.',
          ]}
          tips={[
            'The AI key is only used server-side — it is never exposed to the browser.',
            'AI features are optional — the app works fully without them.',
          ]}
          videoLabel="AI setup guide"
        />
      </HelpSection>

      {/* ── Dashboard ── */}
      <HelpSection icon={LayoutDashboard} gradient="from-blue-500 to-cyan-500" title="Dashboard">
        <ArticleCard
          title="Reading your dashboard"
          description="The Dashboard is your daily briefing — it surfaces the most important items across all your campaigns and requests automatically."
          steps={[
            'The top row shows urgent requests that need immediate attention.',
            'The Blocked section highlights requests stuck in your workflow.',
            'At-Risk Campaigns shows campaigns with low post completion rates.',
            'Upcoming Deadlines shows deliverables due in the next 7 days.',
            'The weekly focus banner shows your primary campaign goal for the week.',
          ]}
          tips={[
            'A campaign is flagged "at-risk" when fewer than 50% of its posts are complete.',
            'Clicking any request card takes you directly to the request detail.',
          ]}
          videoLabel="Dashboard overview"
        />
      </HelpSection>

      {/* ── Campaigns ── */}
      <HelpSection icon={Megaphone} gradient="from-violet-500 to-pink-500" title="Campaigns">
        <ArticleCard
          title="Creating a campaign"
          description="Campaigns are the top-level container for a PR initiative. They hold posts, deliverables, goals, and timelines."
          steps={[
            'Click the "+ New Campaign" button on the Campaigns page or Dashboard.',
            'Enter a campaign name, client, and goal.',
            'Set start and end dates.',
            'Add team members or leave blank to assign later.',
            'Save — your campaign is now active and ready for posts.',
          ]}
          tips={[
            'Use the AI Campaign Planner for a full strategy — not just a blank campaign.',
            'Campaign health is tracked automatically based on post completion.',
          ]}
          videoLabel="Campaign creation walkthrough"
        />
        <ArticleCard
          title="AI Campaign Planning"
          description="The AI Planner uses Gemini to generate a complete campaign strategy including messaging pillars, audience personas, a content calendar, and deliverable checklists."
          steps={[
            'Navigate to a campaign and click "AI Plan", or use the Campaign Planning view.',
            'Enter your campaign brief, goals, and target audience.',
            'Adjust the tone and vibe sliders.',
            'Click "Generate Strategy" — Gemini will build your plan.',
            'Review and edit the generated pillars, personas, and content calendar.',
            'Publish the plan to lock it in and share with your team.',
          ]}
          tips={[
            'You can regenerate individual sections without redoing the whole plan.',
            'Plans are stored as JSON — you can export them for presentations.',
            'Each phase of the planner (brief → strategy → content → approval) saves independently.',
          ]}
          videoLabel="AI Campaign Planning deep-dive"
        />
      </HelpSection>

      {/* ── Inbox & Board ── */}
      <HelpSection icon={Inbox} gradient="from-orange-500 to-amber-500" title="Inbox & Board">
        <ArticleCard
          title="Managing the inbox"
          description="The Inbox collects all incoming content requests — from internal team members or external submissions via a public link. You can filter, triage, and act on requests here."
          steps={[
            'Use the filter bar to narrow by status, urgency, or platform.',
            'Click a request card to open the full detail view.',
            'Change the request status using the status dropdown.',
            'Add comments, pin annotations, or attach files to a request.',
            'Assign a request to a team member using the assignee field.',
          ]}
          tips={[
            'Urgent requests are automatically surfaced on the Dashboard.',
            'You can share a public request form URL for external submissions.',
          ]}
          videoLabel="Inbox and request management"
        />
        <ArticleCard
          title="Using the Kanban board"
          description="The Board view shows requests as cards in status columns — a familiar Kanban layout to visualize your workflow."
          steps={[
            'Navigate to Board from the top nav.',
            'Cards are grouped by status: New, In Progress, In Review, Changes Requested, Approved, Scheduled, Published.',
            'Drag and drop cards between columns to update their status.',
            'Use the filter controls to focus on a single platform or priority level.',
          ]}
          tips={[
            'Blocked requests appear with a warning indicator.',
            'The Board and Inbox show the same requests — different views of the same data.',
          ]}
          videoLabel="Board view tutorial"
        />
      </HelpSection>

      {/* ── Calendar ── */}
      <HelpSection icon={Calendar} gradient="from-green-500 to-emerald-500" title="Calendar">
        <ArticleCard
          title="Navigating the content calendar"
          description="The Calendar shows all your posts and deliverables laid out chronologically so you can spot gaps and plan your publishing schedule."
          steps={[
            'Switch between week and month view using the toggle in the top right.',
            'Navigate forward/backward using the arrow buttons.',
            'Click any post to open its detail view.',
            'Scheduled posts appear in blue, published posts in green.',
            'Posts without a scheduled date will not appear on the calendar.',
          ]}
          tips={[
            'Set scheduled dates on posts during creation or editing to get them on the calendar.',
            'Month view is best for high-level planning; week view for day-to-day execution.',
          ]}
          videoLabel="Calendar walkthrough"
        />
      </HelpSection>

      {/* ── Contacts ── */}
      <HelpSection icon={Users} gradient="from-rose-500 to-red-500" title="Contacts">
        <ArticleCard
          title="Managing media contacts"
          description="Contacts stores your media relationships — journalists, partners, influencers, and press contacts — all in one searchable list."
          steps={[
            'Click "+ New Contact" to add a contact manually.',
            'Fill in name, email, outlet, and role.',
            'Tag contacts by type (journalist, partner, influencer) for easy filtering.',
            'Add notes to capture relationship context.',
            'Reference contacts when creating campaigns or press materials.',
          ]}
          tips={[
            'Keep contact notes up to date — they are visible to the whole workspace.',
            'Future versions will support bulk CSV import.',
          ]}
          videoLabel="Contacts management guide"
        />
      </HelpSection>

      {/* ── To-Do ── */}
      <HelpSection icon={ListTodo} gradient="from-teal-500 to-cyan-600" title="To-Do">
        <ArticleCard
          title="Using the task list"
          description="The To-Do view aggregates all deliverables and tasks across every campaign, grouped by due date. It's your personal daily checklist."
          steps={[
            'Navigate to To-Do from the top nav.',
            'Tasks are grouped: Overdue, Due Today, Due This Week, Upcoming.',
            'Check off tasks as you complete them.',
            'Click a task to jump to the related campaign or deliverable.',
          ]}
          tips={[
            'To-Do pulls from all active campaigns automatically — no manual entry.',
            'Overdue items are highlighted in red to catch your attention.',
          ]}
          videoLabel="To-Do list overview"
        />
      </HelpSection>

      {/* ── Approvals ── */}
      <HelpSection icon={Shield} gradient="from-indigo-500 to-blue-600" title="Approvals">
        <ArticleCard
          title="Configuring approval rules"
          description="Approval rules let you automate the content approval workflow. Rules can be based on platform, content type, priority, or campaign."
          steps={[
            'Go to Settings → Approvals.',
            'Click "+ New Rule" to create an approval rule.',
            'Choose a rule type: Single Approver, Multi-Stage, Auto-Approve, or Emergency Bypass.',
            'Add conditions (e.g. "Platform is Instagram AND Priority is Urgent").',
            'Save the rule — it will apply automatically to matching requests.',
          ]}
          tips={[
            'Auto-Approve rules are great for low-risk, templated content.',
            'Multi-Stage rules let you chain multiple approvers in sequence.',
            'Emergency Bypass rules allow specific roles to skip the normal approval chain.',
          ]}
          videoLabel="Approval rules configuration"
        />
      </HelpSection>

      {/* ── Settings ── */}
      <HelpSection icon={Settings} gradient="from-gray-500 to-slate-600" title="Settings">
        <ArticleCard
          title="Settings overview"
          description="The Settings page has six tabs — Profile, Workspace, Notifications, Appearance, Integrations, and Approvals."
          steps={[
            'Profile — view your account info and sign out.',
            'Workspace — manage team members and send invites.',
            'Notifications — toggle which events trigger alerts.',
            'Appearance — switch between dark and light mode.',
            'Integrations — check your Gemini AI connection status.',
            'Approvals — configure approval rules for your content workflow.',
          ]}
          videoLabel="Settings tour"
        />
      </HelpSection>

      {/* ── Keyboard shortcuts ── */}
      <HelpSection icon={Zap} gradient="from-yellow-500 to-orange-500" title="Keyboard Shortcuts">
        <div className="card p-4 border border-border dark:border-gray-800">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {[
              ['Go to Dashboard', 'Click logo'],
              ['Open Settings', 'Avatar → Settings'],
              ['Refresh data', 'Settings → Refresh'],
              ['Toggle dark mode', 'Sun/Moon icon'],
              ['New campaign', '+ on Campaigns page'],
              ['New request', '+ on Inbox page'],
              ['New contact', '+ on Contacts page'],
            ].map(([label, shortcut]) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-border dark:border-gray-800 last:border-0 col-span-1">
                <span className="text-mutedText">{label}</span>
                <kbd className="px-2 py-0.5 rounded bg-surface2 dark:bg-surface2-dark text-xs font-mono text-text border border-border dark:border-gray-700">
                  {shortcut}
                </kbd>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-mutedText">Full keyboard shortcuts are coming in a future update.</p>
        </div>
      </HelpSection>

      {/* Footer CTA */}
      <div className="flex flex-col items-center gap-3 py-8 border-t border-border dark:border-gray-800 text-center">
        <CheckCircle size={28} className="text-success" />
        <p className="text-base font-semibold text-text">You know Orbit inside out.</p>
        <p className="text-sm text-mutedText">Questions or feedback? Reach out to your workspace owner.</p>
        <button
          onClick={() => onNavigate?.(VIEWS.DASHBOARD)}
          className="btn-primary flex items-center gap-2 mt-2"
        >
          Go to Dashboard <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default HelpView;
