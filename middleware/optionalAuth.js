/**
 * optionalAuth — soft JWT extraction middleware.
 *
 * Attempts to verify the Supabase Bearer token.  If valid, populates req.user
 * exactly as authMiddleware does.  If the token is absent, expired, or invalid
 * the request proceeds WITHOUT a 401 — req.user simply stays undefined.
 *
 * Use this on routes that must remain publicly accessible but should benefit
 * from per-user rate-limit keys when a token is present (e.g. AI endpoints,
 * public submission form).
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const JWT_VERIFY_OPTIONS = { algorithms: ['HS256'] };

export default function optionalAuth(req, _res, next) {
  if (!JWT_SECRET) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET, JWT_VERIFY_OPTIONS);
    if (decoded?.sub) {
      req.user = {
        id:    decoded.sub,
        email: decoded.email,
        role:  decoded.role ?? 'authenticated',
      };
    }
  } catch {
    // Expired or invalid token — silently ignore, don't block the request
  }

  next();
}
