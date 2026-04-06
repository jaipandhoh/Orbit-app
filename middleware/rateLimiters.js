/**
 * Centralised rate-limiter definitions.
 *
 * Key-generation strategy
 * -----------------------
 * Where a valid Supabase JWT is present (set on req.user by authMiddleware or
 * optionalAuth), we key on the user UUID.  This prevents shared IPs (offices,
 * VPNs, NAT gateways) from being treated as a single actor.  Unauthenticated
 * requests fall back to req.ip.
 *
 * Login / signup rate limits
 * --------------------------
 * signInWithPassword() and signUp() go directly from the browser to Supabase's
 * auth servers — they never reach this Express process.  Supabase enforces its
 * own limits (e.g. 3 confirmation emails / hour per IP, 4 OTPs / hour per IP).
 * Those limits can be tuned in Supabase Dashboard → Auth → Rate Limits.
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Prefer authenticated user UUID over IP address.
// Falls back to the library's own ipKeyGenerator so IPv6 addresses are
// normalised (e.g. ::ffff:1.2.3.4 → 1.2.3.4) and bypass attempts are blocked.
const userOrIpKey = (req) => req.user?.id ?? ipKeyGenerator(req);

// ---------------------------------------------------------------------------
// General API — broad protection against scrapers and accidental loops
// ---------------------------------------------------------------------------
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { error: 'Too many requests, please try again later.' },
});

// ---------------------------------------------------------------------------
// AI generation — protects expensive Gemini API calls
// Applies to: campaign-plan, campaign-generate, campaign-palettes,
//             campaign-captions
// ---------------------------------------------------------------------------
export const aiGenerateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { error: 'AI generation limit reached. Please wait before generating more content.' },
});

// ---------------------------------------------------------------------------
// AI chat — more generous since it is conversational (back-and-forth)
// Applies to: campaign-chat
// ---------------------------------------------------------------------------
export const aiChatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { error: 'Chat message limit reached. Please wait before sending more messages.' },
});

// ---------------------------------------------------------------------------
// Public request form — unauthenticated, highest abuse potential
// A legitimate human submitter rarely needs more than a handful per hour.
// ---------------------------------------------------------------------------
export const publicSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  // IP only — no auth on this route
  message: { error: 'Submission limit reached. Please try again later.' },
});

// ---------------------------------------------------------------------------
// Workspace creation — limits post-signup account setup abuse
// ---------------------------------------------------------------------------
export const workspaceCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { error: 'Too many workspace creation attempts. Please try again later.' },
});

// ---------------------------------------------------------------------------
// Workspace invite creation — prevents invite-spam / enumeration
// ---------------------------------------------------------------------------
export const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { error: 'Too many invite requests. Please try again later.' },
});
