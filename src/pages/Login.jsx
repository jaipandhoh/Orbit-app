import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
    <rect x="1"  y="1"  width="9" height="9" fill="#F25022" />
    <rect x="11" y="1"  width="9" height="9" fill="#7FBA00" />
    <rect x="1"  y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ─── Orbital Hero SVG (left panel) ───────────────────────────────────────────

const OrbitalHero = () => (
  <svg
    viewBox="0 0 500 500"
    className="w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.9" />
        <stop offset="50%"  stopColor="#818cf8" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id="rg2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id="rg3" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#a78bfa" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id="rg4" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.04" />
      </linearGradient>
      <radialGradient id="pg" cx="35%" cy="35%">
        <stop offset="0%"   stopColor="#a5b4fc" />
        <stop offset="55%"  stopColor="#6366f1" />
        <stop offset="100%" stopColor="#312e81" />
      </radialGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="softglow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>

      {/* Orbital paths used for both display and animateMotion */}
      <path id="op1" d="M 55,250 A 195,68 0 1,0 445,250 A 195,68 0 1,0 55,250"
        transform="rotate(18 250 250)" fill="none" />
      <path id="op2" d="M 95,250 A 155,58 0 1,0 405,250 A 155,58 0 1,0 95,250"
        transform="rotate(58 250 250)" fill="none" />
      <path id="op3" d="M 132,250 A 118,44 0 1,0 368,250 A 118,44 0 1,0 132,250"
        transform="rotate(-28 250 250)" fill="none" />
      <path id="op4" d="M 168,250 A 82,30 0 1,0 332,250 A 82,30 0 1,0 168,250"
        transform="rotate(75 250 250)" fill="none" />
    </defs>

    {/* Star field */}
    {[
      [48,82,1.5,0.14],[420,60,1,0.10],[460,310,1.5,0.12],[90,390,1,0.10],
      [380,420,1,0.14],[30,250,1,0.10],[480,170,1.5,0.12],[170,48,1,0.10],
      [310,32,1,0.16],[440,460,1,0.10],[60,460,1.5,0.12],[200,480,1,0.10],
      [490,380,1,0.14],[140,140,1,0.12],[360,140,1.5,0.10],[85,155,1,0.14],
      [415,200,1,0.10],[255,70,1,0.16],[270,450,1,0.12],[480,90,1.5,0.10],
      [20,130,1,0.12],[330,480,1,0.10],[450,35,1,0.14],[10,370,1.5,0.10],
    ].map(([x, y, r, opacity], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={opacity} />
    ))}

    {/* Visible orbital rings */}
    <use href="#op1" stroke="url(#rg1)" strokeWidth="1.2" />
    <use href="#op2" stroke="url(#rg2)" strokeWidth="1"   />
    <use href="#op3" stroke="url(#rg3)" strokeWidth="1.5" />
    <use href="#op4" stroke="url(#rg4)" strokeWidth="0.8" />

    {/* Animated nodes — orbit 1, indigo (14s CW) */}
    <circle r="5.5" fill="#818cf8" filter="url(#glow)">
      <animateMotion dur="14s" repeatCount="indefinite"><mpath href="#op1" /></animateMotion>
    </circle>
    {/* Orbit 1 trailing dot, offset half-orbit */}
    <circle r="3" fill="#6366f1" opacity="0.55" filter="url(#glow)">
      <animateMotion dur="14s" repeatCount="indefinite" begin="-7s"><mpath href="#op1" /></animateMotion>
    </circle>

    {/* Orbit 2, sky-blue (9s) */}
    <circle r="6" fill="#38bdf8" filter="url(#glow)">
      <animateMotion dur="9s" repeatCount="indefinite" calcMode="linear"><mpath href="#op2" /></animateMotion>
    </circle>

    {/* Orbit 3, violet (20s) */}
    <circle r="4.5" fill="#c084fc" filter="url(#glow)">
      <animateMotion dur="20s" repeatCount="indefinite"><mpath href="#op3" /></animateMotion>
    </circle>

    {/* Orbit 4, white (6s) */}
    <circle r="3" fill="#e0e7ff" filter="url(#glow)">
      <animateMotion dur="6s" repeatCount="indefinite"><mpath href="#op4" /></animateMotion>
    </circle>

    {/* Center planet — outer glow pulse */}
    <circle cx="250" cy="250" r="32" fill="#6366f1" opacity="0.12" filter="url(#softglow)">
      <animate attributeName="r"       values="28;42;28" dur="3.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.15;0.04;0.15" dur="3.5s" repeatCount="indefinite" />
    </circle>
    {/* Planet body */}
    <circle cx="250" cy="250" r="20" fill="url(#pg)" filter="url(#glow)">
      <animate attributeName="r" values="19;22;19" dur="3.5s" repeatCount="indefinite" />
    </circle>
    {/* Planet specular highlight */}
    <circle cx="244" cy="244" r="5" fill="white" opacity="0.18" />
  </svg>
);

// ─── Feature check item ───────────────────────────────────────────────────────

const Feature = ({ text }) => (
  <div className="flex items-center gap-2.5">
    <span
      className="flex-shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center"
      style={{ background: 'rgba(99,102,241,0.16)', border: '1px solid rgba(99,102,241,0.28)' }}
    >
      <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none" aria-hidden="true">
        <path d="M1.5 5.5L3.8 8L8.5 2.5" stroke="#818cf8" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <span className="text-sm text-gray-300">{text}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Login() {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [info, setInfo]         = useState('');
  const [loading, setLoading]   = useState(false);

  const reset = () => { setError(''); setInfo(''); };

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

  const toggleMode = () => { setMode(m => m === 'login' ? 'signup' : 'login'); reset(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .ol * { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes ol-fadeup {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ol-shimmer {
          0%, 100% { background-position: 0%   50%; }
          50%       { background-position: 100% 50%; }
        }

        .ol-f1 { animation: ol-fadeup 0.5s 0.00s ease both; }
        .ol-f2 { animation: ol-fadeup 0.5s 0.08s ease both; }
        .ol-f3 { animation: ol-fadeup 0.5s 0.16s ease both; }
        .ol-f4 { animation: ol-fadeup 0.5s 0.24s ease both; }
        .ol-f5 { animation: ol-fadeup 0.5s 0.32s ease both; }

        .ol-shimmer {
          background: linear-gradient(120deg, #e0e7ff 0%, #a5b4fc 35%, #818cf8 65%, #c4b5fd 100%);
          background-size: 250% 250%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ol-shimmer 5s ease infinite;
        }

        .ol-input {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          color: #f1f5f9;
          transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
        }
        .ol-input::placeholder { color: rgba(148,163,184,0.4); }
        .ol-input:focus {
          outline: none;
          background: rgba(99,102,241,0.07);
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .ol-sso {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          transition: background 0.18s, border-color 0.18s, transform 0.18s;
        }
        .ol-sso:hover:not(:disabled) {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.16);
          transform: translateY(-1px);
        }
        .ol-sso:active:not(:disabled) { transform: translateY(0); }

        .ol-cta {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          box-shadow: 0 4px 24px rgba(99,102,241,0.35), 0 1px 2px rgba(0,0,0,0.3);
          transition: filter 0.18s, box-shadow 0.18s, transform 0.18s;
        }
        .ol-cta:hover:not(:disabled) {
          filter: brightness(1.12);
          box-shadow: 0 6px 32px rgba(99,102,241,0.5), 0 1px 2px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .ol-cta:active:not(:disabled) { transform: translateY(0); filter: brightness(0.97); }
        .ol-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        .ol-logo-slot {
          border: 1.5px dashed rgba(99,102,241,0.32);
          background: rgba(99,102,241,0.045);
        }

        @media (prefers-reduced-motion: reduce) {
          .ol-f1,.ol-f2,.ol-f3,.ol-f4,.ol-f5 { animation: none; }
          .ol-shimmer { animation: none; }
        }
      `}</style>

      <div className="ol min-h-dvh flex" style={{ background: '#070a17' }}>

        {/* ══════════════════════════════════════
            LEFT PANEL — Orbital brand hero
            ══════════════════════════════════════ */}
        <div
          className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col"
          style={{ background: 'linear-gradient(145deg, #060919 0%, #0a1030 55%, #070c1e 100%)' }}
        >
          {/* Ambient glow blobs */}
          <div className="absolute pointer-events-none"
            style={{ top: '12%', left: '18%', width: 440, height: 440,
              background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
              filter: 'blur(52px)' }} />
          <div className="absolute pointer-events-none"
            style={{ bottom: '22%', right: '12%', width: 280, height: 280,
              background: 'radial-gradient(circle, rgba(14,165,233,0.09) 0%, transparent 70%)',
              filter: 'blur(40px)' }} />
          <div className="absolute pointer-events-none"
            style={{ top: '62%', left: '4%', width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)',
              filter: 'blur(32px)' }} />

          {/* Orbital animation — fills the hero area */}
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ bottom: '26%' }}>
            <OrbitalHero />
          </div>

          {/* Wordmark top-left */}
          <div className="relative z-10 p-9">
            <span className="text-sm font-semibold tracking-[0.18em] text-indigo-400/65 uppercase">
              Orbit
            </span>
          </div>

          {/* Brand copy — bottom of panel */}
          <div className="relative z-10 mt-auto px-10 pb-12">
            <p className="text-[10.5px] font-semibold tracking-[0.16em] text-indigo-400/55 uppercase mb-3">
              PR &amp; Campaign Intelligence
            </p>
            <h2 className="text-[2.1rem] font-bold leading-[1.2] text-white mb-4">
              Your campaigns,<br />
              <span className="ol-shimmer">always in orbit.</span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-7">
              Plan, approve, and publish every piece of communications work from one intelligent workspace.
            </p>
            <div className="space-y-3">
              <Feature text="AI-powered campaign planning" />
              <Feature text="Real-time approval workflows" />
              <Feature text="Multi-channel content management" />
            </div>
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[11px] text-gray-700">
                Built for PR teams that move fast.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT PANEL — Auth form
            ══════════════════════════════════════ */}
        <div
          className="flex-1 flex items-center justify-center px-5 py-14"
          style={{ background: 'linear-gradient(180deg, #080c1e 0%, #070a17 100%)' }}
        >
          <div className="w-full max-w-[385px]">

            {/* ── Logo slot ─────────────────────────────────────────────────────
                Replace the contents of this block with your logo.
                e.g.: <img src="/logo.svg" alt="Orbit" className="w-12 h-12" />
                ──────────────────────────────────────────────────────────────── */}
            <div className="ol-f1 flex flex-col items-center mb-8">
              <div
                className="ol-logo-slot w-[72px] h-[72px] rounded-2xl flex flex-col items-center justify-center gap-1.5 mb-2 select-none"
                title="Replace with your logo"
              >
                <svg viewBox="0 0 26 26" className="w-6 h-6 opacity-35" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="22" height="22" rx="5"
                    stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3.5 3" />
                  <path d="M8 13h10M13 8v10" stroke="#818cf8"
                    strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[8px] font-semibold tracking-[0.14em] text-indigo-400/35 uppercase">
                  Your Logo
                </span>
              </div>
            </div>
            {/* ── End logo slot ── */}

            {/* Heading */}
            <div className="ol-f2 text-center mb-7">
              <h1 className="text-[1.6rem] font-bold text-white tracking-tight mb-1.5">
                {mode === 'login' ? 'Welcome back' : 'Create an account'}
              </h1>
              <p className="text-sm text-gray-500">
                {mode === 'login'
                  ? 'Sign in to your Orbit workspace'
                  : 'Start your free 14-day trial'}
              </p>
            </div>

            {/* SSO buttons */}
            <div className="ol-f3 grid grid-cols-2 gap-2.5 mb-5">
              <button
                type="button"
                onClick={() => signInWithProvider('google')}
                disabled={loading}
                className="ol-sso flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                onClick={() => signInWithProvider('azure')}
                disabled={loading}
                className="ol-sso flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MicrosoftIcon />
                Microsoft
              </button>
            </div>

            {/* Divider */}
            <div className="ol-f3 flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">
                or continue with email
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="ol-f4">
                <label htmlFor="email"
                  className="block text-xs font-medium text-gray-400 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="ol-input w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="you@company.com"
                />
              </div>

              <div className="ol-f4">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password"
                    className="block text-xs font-medium text-gray-400">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="ol-input w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div role="alert" className="rounded-xl px-4 py-3 text-sm text-red-300"
                  style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}
              {info && (
                <div role="status" className="rounded-xl px-4 py-3 text-sm text-emerald-300"
                  style={{ background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {info}
                </div>
              )}

              <div className="ol-f5 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="ol-cta w-full rounded-xl py-3.5 text-sm font-semibold text-white cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <SpinnerIcon />
                      Please wait…
                    </span>
                  ) : mode === 'login' ? 'Sign in to Orbit' : 'Create account'}
                </button>
              </div>
            </form>

            {/* Toggle mode */}
            <p className="ol-f5 mt-6 text-center text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>

            {/* Fine print */}
            <p className="ol-f5 mt-8 text-center text-[11px] text-gray-700 leading-relaxed">
              By continuing you agree to Orbit&rsquo;s{' '}
              <span className="text-gray-600 cursor-pointer hover:text-gray-400 transition-colors">Terms</span>
              {' '}and{' '}
              <span className="text-gray-600 cursor-pointer hover:text-gray-400 transition-colors">Privacy Policy</span>.
            </p>

          </div>
        </div>

      </div>
    </>
  );
}
