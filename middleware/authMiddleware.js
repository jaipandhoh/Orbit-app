import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Supabase JWTs are always HS256. Pinning the algorithm prevents
// algorithm-confusion attacks (e.g. alg:none or RS256 key-confusion).
const JWT_VERIFY_OPTIONS = { algorithms: ['HS256'] };

/**
 * Verifies the Supabase-issued Bearer token attached to each request.
 * On success, sets req.user = { id, email, role }.
 * Supabase JWTs are HS256-signed with the project's JWT Secret
 * (Supabase Dashboard → Settings → API → JWT Secret).
 */
export default function authMiddleware(req, res, next) {
  if (!JWT_SECRET) {
    // Do not reveal config details to the client
    console.error('SUPABASE_JWT_SECRET is not set in .env');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn(`[AUTH_FAILURE] Missing or invalid Authorization header from IP: ${req.ip}`);
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET, JWT_VERIFY_OPTIONS);

    if (!decoded.sub) {
      console.warn(`[AUTH_FAILURE] Missing 'sub' claim in token from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Supabase puts the user UUID in the `sub` claim
    req.user = {
      id:    decoded.sub,
      email: decoded.email,
      role:  decoded.role ?? 'authenticated',
    };
    
    // Log successful auth randomly or specifically for tracing if needed
    // console.info(`[AUTH_SUCCESS] User ${req.user.email} authenticated from IP: ${req.ip}`);
    
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    console.warn(`[AUTH_FAILURE] ${message} from IP: ${req.ip} - ${err.message}`);
    return res.status(401).json({ error: message });
  }
}
