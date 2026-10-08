// Row shapes returned by Supabase. Regenerate the full set with:
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
import type { ItemType } from '../content/types';
import type { AccentName } from '../theme';

export interface Profile {
  id: string;
  display_name: string;
  learning_reason: string | null;
  self_level: number | null;
  daily_goal_xp: 10 | 20 | 30 | 50;
  accent: AccentName;
  timezone: string;
  created_at: string;
}
export interface UserStats {
  user_id: string;
  xp_total: number;
  gems: number;
  hearts: number;
  streak_current: number;
  streak_longest: number;
  last_active_day: string | null;
}
export interface DailyActivity { day: string; xp: number; sessions: number; perfect: number }
export interface MistakeRow { item_type: ItemType; item_id: string; miss_count: number }
export interface AnswerEvent { exercise_type: string; item_type?: ItemType; item_id?: string; correct: boolean }
export interface SessionResult {
  session_id: string;
  xp_earned: number;
  accuracy: number;
  perfect: boolean;
  healed: boolean;
  quest_gems: number;
  day_xp: number;
  stats: UserStats;
}
export interface LeaderRow { rank: number; display_name: string; xp: number; is_me: boolean }
