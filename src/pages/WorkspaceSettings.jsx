import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Users, Crown, Shield, User, Loader2, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const ROLE_LABELS = { owner: 'Owner', admin: 'Admin', member: 'Member' };

export default function WorkspaceSettings() {
  const { currentWorkspace, authFetch } = useAuth();

  const [members, setMembers]         = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting]       = useState(false);
  const [inviteLink, setInviteLink]   = useState('');
  const [copied, setCopied]           = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  // ── Load members ───────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoadingMembers(true);
    try {
      const res = await authFetch(`/api/workspaces/${currentWorkspace.id}/members`);
      if (res.ok) setMembers(await res.json());
    } catch {
      // swallow — non-critical
    } finally {
      setLoadingMembers(false);
    }
  }, [currentWorkspace, authFetch]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // ── Send invite ────────────────────────────────────────────────────────────
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setError('');
    setSuccess('');
    setInviteLink('');
    setInviting(true);

    try {
      const res = await authFetch(`/api/workspaces/${currentWorkspace.id}/invites`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to send invite');
      } else {
        setInviteLink(data.invite_url);
        setSuccess(`Invite created for ${inviteEmail.trim()}`);
        setInviteEmail('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!currentWorkspace) {
    return <p className="p-8 text-gray-500">No workspace selected.</p>;
  }

  const canInvite = ['owner', 'admin'].includes(currentWorkspace.my_role);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">{currentWorkspace.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Workspace settings</p>
      </div>

      {/* Members section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
            Members
          </h2>
        </div>

        {loadingMembers ? (
          <div className="flex items-center gap-2 text-gray-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading members…</span>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800 rounded-xl border border-gray-800 overflow-hidden">
            {members.map(m => {
              const Icon = ROLE_ICONS[m.role] ?? User;
              return (
                <li key={m.id} className="flex items-center gap-3 px-4 py-3 bg-gray-900">
                  <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(m.name || m.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {m.name || m.email}
                    </p>
                    {m.name && (
                      <p className="text-xs text-gray-500 truncate">{m.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Icon className="w-3.5 h-3.5" />
                    {ROLE_LABELS[m.role]}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Invite section (owners/admins only) */}
      {canInvite && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              Invite a member
            </h2>
          </div>

          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1 rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={inviting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 shrink-0"
            >
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Invite
            </button>
          </form>

          {error && (
            <p className="mt-2 text-sm text-red-400 bg-red-950/40 rounded-lg px-3 py-2">{error}</p>
          )}

          {success && !error && (
            <p className="mt-2 text-sm text-green-400">{success}</p>
          )}

          {inviteLink && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-900 border border-gray-700 px-3 py-2">
              <p className="flex-1 text-xs text-gray-400 truncate">{inviteLink}</p>
              <button
                onClick={copyLink}
                className="shrink-0 text-gray-400 hover:text-white transition"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}

          <p className="mt-2 text-xs text-gray-600">Invite links expire after 7 days.</p>
        </section>
      )}
    </div>
  );
}
