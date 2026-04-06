import { Router } from 'express';
import { randomBytes } from 'crypto';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { workspaceCreateLimiter, inviteLimiter } from '../middleware/rateLimiters.js';

const router = Router();

// All workspace routes require auth
router.use(authMiddleware);

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the requesting user's role in a workspace, or null if not a member.
 */
async function getMemberRole(workspaceId, userId) {
  const [rows] = await pool.query(
    `SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?`,
    [workspaceId, userId]
  );
  return rows[0]?.role ?? null;
}

// ─── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/workspaces
 * Returns every workspace the logged-in user belongs to, including their role.
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.id, w.name, w.is_personal, w.owner_id, w.created_at,
              wm.role AS my_role
       FROM   workspaces w
       JOIN   workspace_members wm ON w.id = wm.workspace_id
       WHERE  wm.user_id = ?
       ORDER  BY w.is_personal DESC, w.created_at ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[GET /workspaces]', err);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

/**
 * POST /api/workspaces
 * Creates a new (non-personal) team workspace.
 * Body: { name: string }
 */
router.post('/', workspaceCreateLimiter, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Workspace name is required' });
  }

  try {
    const [workspace] = await pool.query(
      `INSERT INTO workspaces (name, owner_id, is_personal) VALUES (?, ?, false)`,
      [name.trim(), req.user.id]
    );

    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES (?, ?, 'owner')`,
      [workspace.insertId, req.user.id]
    );

    res.status(201).json({
      id:          workspace.insertId,
      name:        name.trim(),
      is_personal: false,
      owner_id:    req.user.id,
      my_role:     'owner',
    });
  } catch (err) {
    console.error('[POST /workspaces]', err);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

/**
 * GET /api/workspaces/:id/members
 * Returns the member list for a workspace (caller must be a member).
 */
router.get('/:id/members', async (req, res) => {
  const { id } = req.params;
  try {
    const role = await getMemberRole(id, req.user.id);
    if (!role) return res.status(403).json({ error: 'Access denied' });

    const [members] = await pool.query(
      `SELECT p.id, p.name, p.email, p.avatar_url,
              wm.role, wm.joined_at
       FROM   workspace_members wm
       JOIN   profiles p ON p.id = wm.user_id
       WHERE  wm.workspace_id = ?
       ORDER  BY wm.joined_at ASC`,
      [id]
    );
    res.json(members);
  } catch (err) {
    console.error('[GET /workspaces/:id/members]', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

/**
 * POST /api/workspaces/:id/invites
 * Generates an invite link for the given email.
 * Caller must be owner or admin.
 * Body: { email: string }
 */
router.post('/:id/invites', inviteLimiter, async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const role = await getMemberRole(id, req.user.id);
    if (!['owner', 'admin'].includes(role)) {
      return res.status(403).json({ error: 'Only owners and admins can invite members' });
    }

    // Expire any existing pending invite for this email+workspace
    await pool.query(
      `UPDATE workspace_invites
       SET    status = 'expired'
       WHERE  workspace_id = ? AND email = ? AND status = 'pending'`,
      [id, email.trim().toLowerCase()]
    );

    const token     = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO workspace_invites (workspace_id, email, invited_by, token, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, email.trim().toLowerCase(), req.user.id, token, expiresAt]
    );

    const appUrl    = process.env.APP_URL ?? 'http://localhost:5173';
    const inviteUrl = `${appUrl}/invite?token=${token}`;

    res.status(201).json({ token, invite_url: inviteUrl, expires_at: expiresAt });
  } catch (err) {
    console.error('[POST /workspaces/:id/invites]', err);
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

/**
 * POST /api/workspaces/invites/accept
 * Accepts a pending invite and adds the authenticated user to the workspace.
 * Body: { token: string }
 *
 * NOTE: This route must be defined BEFORE /:id routes so Express doesn't
 * capture "invites" as a workspace :id.
 */
router.post('/invites/accept', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const [invites] = await pool.query(
      `SELECT * FROM workspace_invites
       WHERE  token = ? AND status = 'pending' AND expires_at > NOW()`,
      [token]
    );

    if (!invites.length) {
      return res.status(400).json({ error: 'Invalid or expired invite link' });
    }

    const invite = invites[0];

    if (invite.email !== req.user.email.toLowerCase()) {
      return res.status(403).json({ error: 'This invite was sent to a different email address' });
    }

    // Idempotent: already a member?
    const existingRole = await getMemberRole(invite.workspace_id, req.user.id);
    if (existingRole) {
      return res.status(409).json({ error: 'You are already a member of this workspace' });
    }

    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'member')`,
      [invite.workspace_id, req.user.id]
    );

    await pool.query(
      `UPDATE workspace_invites SET status = 'accepted' WHERE id = ?`,
      [invite.id]
    );

    res.json({ workspace_id: invite.workspace_id });
  } catch (err) {
    console.error('[POST /workspaces/invites/accept]', err);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

export default router;
