import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const useMockAuth     = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

let client;

if (useMockAuth) {
  let currentSession = null;
  const listeners = new Set();

  try {
    const saved = localStorage.getItem('orbit_mock_session');
    if (saved) {
      currentSession = JSON.parse(saved);
    }
  } catch (e) {}

  const triggerListeners = (event) => {
    for (const listener of listeners) {
      listener(event, currentSession);
    }
  };

  client = {
    auth: {
      signInWithPassword: async ({ email, password }) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) {
            const errData = await res.json();
            return { data: { user: null, session: null }, error: { message: errData.error || 'Login failed' } };
          }
          const data = await res.json();
          currentSession = data.session;
          localStorage.setItem('orbit_mock_session', JSON.stringify(currentSession));
          triggerListeners('SIGNED_IN');
          return { data: { user: currentSession.user, session: currentSession }, error: null };
        } catch (err) {
          return { data: { user: null, session: null }, error: { message: err.message } };
        }
      },
      signUp: async ({ email, password }) => {
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) {
            const errData = await res.json();
            return { data: { user: null, session: null }, error: { message: errData.error || 'Signup failed' } };
          }
          const data = await res.json();
          return { data: { user: data.user, session: null }, error: null };
        } catch (err) {
          return { data: { user: null, session: null }, error: { message: err.message } };
        }
      },
      signOut: async () => {
        currentSession = null;
        localStorage.removeItem('orbit_mock_session');
        triggerListeners('SIGNED_OUT');
        return { error: null };
      },
      getSession: async () => {
        return { data: { session: currentSession }, error: null };
      },
      onAuthStateChange: (callback) => {
        listeners.add(callback);
        // Immediately invoke callback with the current state (async to match Supabase)
        setTimeout(() => {
          callback('INITIAL_SESSION', currentSession);
        }, 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                listeners.delete(callback);
              },
            },
          },
        };
      },
    },
  };
} else {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file.'
    );
  }
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
