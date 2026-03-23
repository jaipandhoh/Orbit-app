import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]               = useState(null);
  const [user, setUser]                     = useState(null);
  const [workspaces, setWorkspaces]         = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading]               = useState(true);

  // ── Fetch workspaces from the Express API ─────────────────────────────────
  const fetchWorkspaces = useCallback(async (accessToken) => {
    try {
      const res = await fetch('/api/workspaces', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setWorkspaces(data);

      // Restore previously selected workspace from localStorage, else default to personal
      const savedId = localStorage.getItem('orbit_workspace_id');
      const saved   = savedId ? data.find(w => w.id === savedId) : null;
      setCurrentWorkspace(saved ?? data.find(w => w.is_personal) ?? data[0] ?? null);
    } catch (err) {
      console.error('[AuthContext] Failed to load workspaces:', err);
    }
  }, []);

  // ── Bootstrap session on mount ────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) fetchWorkspaces(session.access_token);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        fetchWorkspaces(session.access_token);
      } else {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        localStorage.removeItem('orbit_workspace_id');
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchWorkspaces]);

  // ── Persist workspace selection ───────────────────────────────────────────
  const selectWorkspace = useCallback((workspace) => {
    setCurrentWorkspace(workspace);
    if (workspace) {
      localStorage.setItem('orbit_workspace_id', workspace.id);
    } else {
      localStorage.removeItem('orbit_workspace_id');
    }
  }, []);

  // ── Convenience helper: attach auth header to any fetch call ──────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const token = session?.access_token;
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }, [session]);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const refreshWorkspaces = useCallback(() => {
    if (session) fetchWorkspaces(session.access_token);
  }, [session, fetchWorkspaces]);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      workspaces,
      currentWorkspace,
      setCurrentWorkspace: selectWorkspace,
      signOut,
      authFetch,
      loading,
      refreshWorkspaces,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
