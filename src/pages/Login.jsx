import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import OrbitLogo from '../OrbitLogo';

// ─── SVG icons (inline, no extra deps) ──────────────────────────────────────

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" className="w-5 h-5" aria-hidden="true">
    <rect x="1"  y="1"  width="9" height="9" fill="#F25022" />
    <rect x="11" y="1"  width="9" height="9" fill="#7FBA00" />
    <rect x="1"  y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

export default function Login() {
  const [mode, setMode]       = useState('login');   // 'login' | 'signup'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setError(''); setInfo(''); };

  // ── OAuth ────────────────────────────────────────────────────────────────
  const signInWithProvider = async (provider) => {
    reset();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  // ── Email / Password ─────────────────────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    reset();
    setLoading(true);

    let result;
    if (mode === 'signup') {
      result = await supabase.auth.signUp({ email, password });
      if (!result.error) {
        setInfo('Check your email for a confirmation link before signing in.');
        setLoading(false);
        return;
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) setError(result.error.message);
    setLoading(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <OrbitLogo className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Orbit</h1>
          <p className="text-sm text-gray-400">
            {mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}
          </p>
        </div>

        {/* SSO Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => signInWithProvider('google')}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            onClick={() => signInWithProvider('azure')}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50"
          >
            <MicrosoftIcon />
            Continue with Microsoft
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Email / Password form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 rounded-lg px-3 py-2">{error}</p>
          )}
          {info && (
            <p className="text-sm text-green-400 bg-green-950/40 rounded-lg px-3 py-2">{info}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-gray-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
