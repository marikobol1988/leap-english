import { create } from 'zustand';
import type { SessionKind } from '../engine/exercises';
import { accents, type AccentName } from '../theme';
import { supabase } from './supabase';
import type { AnswerEvent, DailyActivity, LeaderRow, MistakeRow, Profile, SessionResult, UserStats } from './types';

interface ProgressState {
  ready: boolean;
  profile: Profile | null;
  stats: UserStats | null;
  done: Set<string>;
  mistakes: MistakeRow[];
  today: DailyActivity | null;
  week: DailyActivity[];
  load: () => Promise<void>;
  clear: () => void;
  completeSession: (input: { kind: SessionKind; nodeId?: string; mode?: string; unitIds: string[]; answers: AnswerEvent[]; startedAt: Date }) => Promise<SessionResult>;
  loseHeart: () => Promise<void>;
  refillHearts: () => Promise<void>;
  openChest: (nodeId: string) => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, 'display_name' | 'daily_goal_xp' | 'accent'>>) => Promise<void>;
  leaderboard: () => Promise<LeaderRow[]>;
  resetProgress: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const must = <T,>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
};

/** YYYY-MM-DD in device local time (the server uses the profile timezone, Tbilisi by default). */
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Monday of the current week. */
function weekStart() {
  const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return ymd(d);
}

export const useProgress = create<ProgressState>((set, get) => ({
  ready: false,
  profile: null,
  stats: null,
  done: new Set(),
  mistakes: [],
  today: null,
  week: [],

  async load() {
    const [profile, stats, nodes, mistakes, week] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('user_stats').select('*').single(),
      supabase.from('node_progress').select('node_id'),
      supabase.from('item_mistakes').select('item_type,item_id,miss_count').order('last_missed_at', { ascending: false }).limit(40),
      supabase.from('daily_activity').select('day,xp,sessions,perfect').gte('day', weekStart()).order('day'),
    ]);
    const weekRows = must<DailyActivity[]>(week);
    const todayStr = ymd(new Date());
    set({
      ready: true,
      profile: must<Profile>(profile),
      stats: must<UserStats>(stats),
      done: new Set(must<{ node_id: string }[]>(nodes).map((n) => n.node_id)),
      mistakes: must<MistakeRow[]>(mistakes),
      week: weekRows,
      today: weekRows.find((d) => d.day === todayStr) ?? null,
    });
  },

  clear() { set({ ready: false, profile: null, stats: null, done: new Set(), mistakes: [], today: null, week: [] }); },

  async completeSession({ kind, nodeId, mode, unitIds, answers, startedAt }) {
    const result = must<SessionResult>(await supabase.rpc('complete_session', {
      p_kind: kind, p_node_id: nodeId ?? null, p_practice_mode: mode ?? null, p_unit_ids: unitIds,
      p_answers: answers, p_started_at: startedAt.toISOString(),
    }));
    set({ stats: result.stats });
    await get().load(); // refresh path, mistakes and activity
    return result;
  },

  async loseHeart() {
    const hearts = must<number>(await supabase.rpc('lose_heart'));
    const s = get().stats; if (s) set({ stats: { ...s, hearts } });
  },
  async refillHearts() { set({ stats: must<UserStats>(await supabase.rpc('refill_hearts')) }); },
  async openChest(nodeId) {
    set({ stats: must<UserStats>(await supabase.rpc('open_chest', { p_node_id: nodeId })) });
    set({ done: new Set([...get().done, nodeId]) });
  },
  async updateProfile(patch) {
    const p = get().profile; if (!p) return;
    set({ profile: { ...p, ...patch } as Profile }); // optimistic
    must(await supabase.from('profiles').update(patch).eq('id', p.id));
  },
  async leaderboard() { return must<LeaderRow[]>(await supabase.rpc('weekly_leaderboard', { p_limit: 30 })); },
  async resetProgress() { must(await supabase.rpc('reset_my_progress')); await get().load(); },
  async deleteAccount() { must(await supabase.rpc('delete_my_account')); get().clear(); await supabase.auth.signOut(); },
}));

export const useAccentName = (): AccentName => useProgress((s) => s.profile?.accent ?? 'yellow');
export const useAccent = () => accents[useAccentName()];
