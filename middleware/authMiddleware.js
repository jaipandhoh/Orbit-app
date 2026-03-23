import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

/**
 * Verifies the Supabase-issued Bearer token attached to each request.
 * On success, sets req.user = { id, email, role }.
 * Supabase JWTs are HS256-signed with the project's JWT Secret
 * (Supabase Dashboard → Settings → API → JWT Secret).
 */
export default function authMiddleware(req, res, next) {
  if (!JWT_SECRET) {
    console.error('SUPABASE_JWT_SECRET is not set in .env');
    return res.status(500).json({ error: 'Server auth misconfiguration' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Supabase puts the user UUID in the `sub` claim
    req.user = {
      id:    decoded.sub,
      email: decoded.email,
      role:  decoded.role ?? 'authenticated',
    };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ error: message });
  }
}
