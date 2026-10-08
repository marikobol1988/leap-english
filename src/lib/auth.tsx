import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';

interface SignUpInput { email: string; password: string; displayName: string; learningReason?: string; selfLevel?: number; dailyGoalXp: number }
interface AuthState {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (input: SignUpInput) => Promise<string | null>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Supabase error messages are English; map the common ones to Georgian. */
function kaError(message: string): string {
  if (/invalid login/i.test(message)) return 'ელფოსტა ან პაროლი არასწორია.';
  if (/already registered/i.test(message)) return 'ამ ელფოსტით ანგარიში უკვე არსებობს. სცადე შესვლა.';
  if (/password/i.test(message)) return 'პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს.';
  if (/email/i.test(message)) return 'შეიყვანე სწორი ელფოსტა.';
  return 'რაღაც შეცდომა მოხდა. სცადე თავიდან.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    session,
    loading,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      return error ? kaError(error.message) : null;
    },
    async signUp({ email, password, displayName, learningReason, selfLevel, dailyGoalXp }) {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        // read by public.handle_new_user() to fill the profile
        options: { data: { display_name: displayName, learning_reason: learningReason, self_level: selfLevel, daily_goal_xp: dailyGoalXp } },
      });
      return error ? kaError(error.message) : null;
    },
    async sendPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      return error ? kaError(error.message) : null;
    },
    async signOut() { await supabase.auth.signOut(); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
