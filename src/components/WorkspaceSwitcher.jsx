import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, authFetch, refreshWorkspaces } = useAuth();
  const [open, setOpen]           = useState(false);
  const [creating, setCreating]   = useState(false);
  const [newName, setNewName]     = useState('');
  const [error, setError]         = useState('');
  const dropdownRef               = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    try {
      const res = await authFetch('/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create workspace');
        return;
      }
      const workspace = await res.json();
      refreshWorkspaces();
      setCurrentWorkspace(workspace);
      setNewName('');
      setCreating(false);
      setOpen(false);
    } catch {
      setError('Network error. Please try again.');
    }
  };

  if (!currentWorkspace) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => { setOpen(o => !o); setCreating(false); }}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-800 transition"
      >
        <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="max-w-[140px] truncate">{currentWorkspace.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-gray-700 bg-gray-900 shadow-xl z-50 overflow-hidden">

          {/* Workspace list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => { setCurrentWorkspace(ws); setOpen(false); }}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 transition"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="truncate font-medium">{ws.name}</p>
                  {ws.is_personal && (
                    <p className="text-xs text-gray-500">Personal</p>
                  )}
                </div>
                {currentWorkspace.id === ws.id && (
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-800" />

          {/* Create new workspace */}
          {creating ? (
            <form onSubmit={handleCreate} className="p-3 space-y-2">
              <input
                autoFocus
                type="text"
                placeholder="Workspace name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setError(''); setNewName(''); }}
                  className="flex-1 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition"
            >
              <Plus className="w-4 h-4" />
              New workspace
            </button>
          )}
        </div>
      )}
    </div>
  );
}
