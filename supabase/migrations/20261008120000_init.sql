-- Leap English: initial schema
-- Content tables are public and read-only for clients.
-- User tables are readable only by their owner and are written only by
-- the security-definer functions at the bottom of this file, so a client
-- cannot award itself XP, gems or streak days.

-- ============================================================
-- Types
-- ============================================================
create type public.node_kind as enum ('lesson', 'chest', 'review');
create type public.session_kind as enum ('lesson', 'review', 'practice');
create type public.item_type as enum ('vocab', 'phrase', 'dialog');

-- ============================================================
-- Content
-- ============================================================
create table public.characters (
  id           text primary key,                 -- 'nino', 'tom'
  name         text not null,                    -- display name: 'ნინო', 'Tom'
  is_georgian  boolean not null default false,
  bio_ka       text not null default '',
  look         jsonb not null default '{}'::jsonb -- avatar colours and hair style
);

create table public.sections (
  id             text primary key,               -- 's1'
  position       int  not null unique,
  cefr           text not null check (cefr in ('A1','A2','B1','B2','C1','C2')),
  name_ka        text not null,
  description_ka text not null default '',
  is_locked      boolean not null default false
);

create table public.units (
  id            text primary key,                -- 'u1'
  section_id    text not null references public.sections(id) on delete cascade,
  position      int  not null,                   -- order inside the section
  title_en      text not null,
  title_ka      text not null,
  tip_ka        text not null default '',        -- grammar tip shown in the side rail
  short_tip_ka  text not null default '',        -- one-liner shown after correct answers
  scene_ka      text not null default '',
  host_id       text not null references public.characters(id),   -- Georgian character
  partner_id    text not null references public.characters(id),   -- English-speaking character
  grammar       jsonb not null default '{}'::jsonb,               -- {title, explanation, examples:[{en,ka}]}
  sound_tip_ka  text not null default '',
  note_ka       text not null default '',
  is_published  boolean not null default true,
  unique (section_id, position)
);

create table public.vocab_items (
  id         text primary key,                   -- 'u1.v1'
  unit_id    text not null references public.units(id) on delete cascade,
  position   int  not null,
  en         text not null,
  ka         text not null,
  phonetic   text,
  image_key  text,
  audio_path text,                               -- Supabase Storage path, filled when audio is recorded
  unique (unit_id, position)
);

create table public.phrases (
  id         text primary key,                   -- 'u1.p1'
  unit_id    text not null references public.units(id) on delete cascade,
  position   int  not null,
  en         text not null,
  ka         text not null,
  audio_path text,
  unique (unit_id, position)
);

create table public.dialog_lines (
  id         text primary key,                   -- 'u1.d1'
  unit_id    text not null references public.units(id) on delete cascade,
  position   int  not null,
  speaker_id text not null references public.characters(id),
  en         text not null,
  ka         text not null,
  audio_path text,
  unique (unit_id, position)
);

create table public.common_mistakes (
  id       text primary key,                     -- 'u1.m1'
  unit_id  text not null references public.units(id) on delete cascade,
  position int  not null,
  wrong    text not null,
  correct  text not null,
  note_ka  text not null default '',
  unique (unit_id, position)
);

-- Georgian word or two-word phrase -> English hint shown on hover / tap
create table public.glossary (
  ka text primary key,
  en text not null
);

-- The lesson path. seq is the global order used for unlocking.
create table public.path_nodes (
  id            text primary key,                -- 'u1.n1'
  unit_id       text not null references public.units(id) on delete cascade,
  position      int  not null,
  seq           int  not null unique,
  kind          public.node_kind not null,
  lesson_number int,
  unique (unit_id, position)
);

create index on public.vocab_items (unit_id);
create index on public.phrases (unit_id);
create index on public.dialog_lines (unit_id);
create index on public.common_mistakes (unit_id);
create index on public.path_nodes (unit_id);

-- ============================================================
-- Users and progress
-- ============================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null default '',
  learning_reason text,
  self_level      smallint check (self_level between 0 and 3),
  daily_goal_xp   int  not null default 20 check (daily_goal_xp in (10, 20, 30, 50)),
  accent          text not null default 'yellow' check (accent in ('yellow','blue','orange')),
  timezone        text not null default 'Asia/Tbilisi',
  created_at      timestamptz not null default now()
);

create table public.user_stats (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  xp_total        int not null default 0 check (xp_total >= 0),
  gems            int not null default 120 check (gems >= 0),
  hearts          smallint not null default 5 check (hearts between 0 and 5),
  streak_current  int not null default 0,
  streak_longest  int not null default 0,
  last_active_day date,
  updated_at      timestamptz not null default now()
);

create table public.node_progress (
  user_id            uuid not null references public.profiles(id) on delete cascade,
  node_id            text not null references public.path_nodes(id) on delete cascade,
  first_completed_at timestamptz not null default now(),
  last_completed_at  timestamptz not null default now(),
  times_completed    int not null default 1,
  best_accuracy      smallint,
  primary key (user_id, node_id)
);

create table public.learning_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  kind          public.session_kind not null,
  practice_mode text,                            -- quick, words, listen, write, build, talk, mistakes, unit
  node_id       text references public.path_nodes(id) on delete set null,
  unit_ids      text[] not null default '{}',
  solved        int not null,
  mistakes      int not null,
  accuracy      smallint not null,
  perfect       boolean not null,
  xp_earned     int not null,
  started_at    timestamptz,
  finished_at   timestamptz not null default now()
);
create index on public.learning_sessions (user_id, finished_at desc);

-- One row per checked answer. Useful for finding hard content later.
create table public.answer_events (
  id            bigint generated always as identity primary key,
  session_id    uuid not null references public.learning_sessions(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  exercise_type text not null,                   -- word, choose, build, listen, type, fill, reply, match
  item_type     public.item_type,
  item_id       text,
  correct       boolean not null,
  created_at    timestamptz not null default now()
);
create index on public.answer_events (item_type, item_id);

-- Items the learner got wrong and has not yet answered correctly (Practice > mistakes)
create table public.item_mistakes (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  item_type      public.item_type not null,
  item_id        text not null,
  miss_count     int not null default 1,
  last_missed_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

create table public.daily_activity (
  user_id  uuid not null references public.profiles(id) on delete cascade,
  day      date not null,                        -- in the learner's own timezone
  xp       int  not null default 0,
  sessions int  not null default 0,
  perfect  int  not null default 0,
  primary key (user_id, day)
);

create table public.quest_claims (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  day        date not null,
  quest_id   text not null check (quest_id in ('xp', 'lessons', 'perfect')),
  gems       int  not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, day, quest_id)
);

-- ============================================================
-- Row level security
-- ============================================================
alter table public.characters      enable row level security;
alter table public.sections        enable row level security;
alter table public.units           enable row level security;
alter table public.vocab_items     enable row level security;
alter table public.phrases         enable row level security;
alter table public.dialog_lines    enable row level security;
alter table public.common_mistakes enable row level security;
alter table public.glossary        enable row level security;
alter table public.path_nodes      enable row level security;
alter table public.profiles        enable row level security;
alter table public.user_stats      enable row level security;
alter table public.node_progress   enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.answer_events   enable row level security;
alter table public.item_mistakes   enable row level security;
alter table public.daily_activity  enable row level security;
alter table public.quest_claims    enable row level security;

-- Content: anyone may read
create policy "content readable" on public.characters      for select to anon, authenticated using (true);
create policy "content readable" on public.sections        for select to anon, authenticated using (true);
create policy "content readable" on public.units           for select to anon, authenticated using (is_published);
create policy "content readable" on public.vocab_items     for select to anon, authenticated using (true);
create policy "content readable" on public.phrases         for select to anon, authenticated using (true);
create policy "content readable" on public.dialog_lines    for select to anon, authenticated using (true);
create policy "content readable" on public.common_mistakes for select to anon, authenticated using (true);
create policy "content readable" on public.glossary        for select to anon, authenticated using (true);
create policy "content readable" on public.path_nodes      for select to anon, authenticated using (true);

-- User data: owner may read; profile settings are the only direct write
create policy "own profile"   on public.profiles          for select to authenticated using (id = (select auth.uid()));
create policy "edit profile"  on public.profiles          for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "own stats"     on public.user_stats        for select to authenticated using (user_id = (select auth.uid()));
create policy "own progress"  on public.node_progress     for select to authenticated using (user_id = (select auth.uid()));
create policy "own sessions"  on public.learning_sessions for select to authenticated using (user_id = (select auth.uid()));
create policy "own answers"   on public.answer_events     for select to authenticated using (user_id = (select auth.uid()));
create policy "own mistakes"  on public.item_mistakes     for select to authenticated using (user_id = (select auth.uid()));
create policy "own activity"  on public.daily_activity    for select to authenticated using (user_id = (select auth.uid()));
create policy "own quests"    on public.quest_claims      for select to authenticated using (user_id = (select auth.uid()));

-- Only these profile columns are editable by the client
revoke update on public.profiles from anon, authenticated;
grant update (display_name, learning_reason, self_level, daily_goal_xp, accent, timezone) on public.profiles to authenticated;

-- ============================================================
-- Helpers
-- ============================================================
create or replace function public.local_day(p_user uuid)
returns date
language sql stable security definer set search_path = ''
as $$
  select (now() at time zone coalesce((select timezone from public.profiles where id = p_user), 'Asia/Tbilisi'))::date;
$$;

-- New sign-up: create profile + stats. Onboarding answers come from sign-up metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  goal int := coalesce((meta->>'daily_goal_xp')::int, 20);
begin
  if goal not in (10, 20, 30, 50) then goal := 20; end if;
  insert into public.profiles (id, display_name, learning_reason, self_level, daily_goal_xp)
  values (new.id,
          coalesce(meta->>'display_name', ''),
          meta->>'learning_reason',
          nullif(meta->>'self_level', '')::smallint,
          goal);
  insert into public.user_stats (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Is this node open for the user? First node is always open; others need the previous one done.
create or replace function public.node_unlocked(p_user uuid, p_node text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select case
    when n.seq = (select min(seq) from public.path_nodes) then true
    else exists (
      select 1 from public.node_progress np
      join public.path_nodes prev on prev.id = np.node_id
      where np.user_id = p_user
        and prev.seq = (select max(seq) from public.path_nodes where seq < n.seq))
  end
  from public.path_nodes n where n.id = p_node;
$$;

-- ============================================================
-- Game actions (the only way user progress changes)
-- ============================================================

-- Called once when a lesson / review / practice session ends.
-- p_answers: [{"exercise_type":"build","item_type":"phrase","item_id":"u1.p3","correct":true}, ...]
create or replace function public.complete_session(
  p_kind          public.session_kind,
  p_node_id       text,
  p_practice_mode text,
  p_unit_ids      text[],
  p_answers       jsonb,
  p_started_at    timestamptz default null
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  uid        uuid := auth.uid();
  st         public.user_stats;
  node       public.path_nodes;
  today      date;
  v_solved   int;
  v_mistakes int;
  v_accuracy smallint;
  v_perfect  boolean;
  v_xp       int;
  v_replay   boolean := false;
  v_healed   boolean := false;
  v_session  uuid;
  v_goal     int;
  v_day      public.daily_activity;
  v_quest_gems int := 0;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if jsonb_typeof(p_answers) is distinct from 'array' or jsonb_array_length(p_answers) = 0 then
    raise exception 'answers required' using errcode = '22023';
  end if;
  if jsonb_array_length(p_answers) > 60 then
    raise exception 'too many answers' using errcode = '22023';
  end if;

  select * into st from public.user_stats where user_id = uid for update;
  today := public.local_day(uid);

  if p_kind in ('lesson', 'review') then
    select * into node from public.path_nodes where id = p_node_id;
    if not found then raise exception 'unknown node' using errcode = '22023'; end if;
    if node.kind::text <> p_kind::text then raise exception 'node kind mismatch' using errcode = '22023'; end if;
    if not public.node_unlocked(uid, p_node_id) then raise exception 'node locked' using errcode = '42501'; end if;
    if st.hearts <= 0 then raise exception 'no hearts' using errcode = '42501'; end if;
    v_replay := exists (select 1 from public.node_progress where user_id = uid and node_id = p_node_id);
  end if;

  select count(*) filter (where (a->>'correct')::boolean),
         count(*) filter (where not (a->>'correct')::boolean)
    into v_solved, v_mistakes
    from jsonb_array_elements(p_answers) a;

  v_accuracy := round(100.0 * v_solved / greatest(1, v_solved + v_mistakes));
  v_perfect  := v_mistakes = 0;
  v_xp := case
            when p_kind = 'practice' then 5
            when p_kind = 'review'   then 20
            when v_replay            then 5
            else 10
          end + case when v_perfect and p_kind <> 'practice' then 5 else 0 end;

  -- session log + answers
  insert into public.learning_sessions (user_id, kind, practice_mode, node_id, unit_ids, solved, mistakes, accuracy, perfect, xp_earned, started_at)
  values (uid, p_kind, p_practice_mode, case when p_kind = 'practice' then null else p_node_id end,
          coalesce(p_unit_ids, '{}'), v_solved, v_mistakes, v_accuracy, v_perfect, v_xp, p_started_at)
  returning id into v_session;

  insert into public.answer_events (session_id, user_id, exercise_type, item_type, item_id, correct)
  select v_session, uid, a->>'exercise_type', nullif(a->>'item_type', '')::public.item_type, a->>'item_id', (a->>'correct')::boolean
  from jsonb_array_elements(p_answers) a;

  -- mistake memory: a wrong answer remembers the item, the latest correct answer clears it
  with last_answer as (
    select distinct on (a->>'item_type', a->>'item_id')
           (a->>'item_type')::public.item_type as item_type, a->>'item_id' as item_id, (a->>'correct')::boolean as correct, ord
    from jsonb_array_elements(p_answers) with ordinality as t(a, ord)
    where coalesce(a->>'item_type', '') <> '' and coalesce(a->>'item_id', '') <> ''
    order by a->>'item_type', a->>'item_id', ord desc
  ), cleared as (
    delete from public.item_mistakes m using last_answer l
    where m.user_id = uid and m.item_type = l.item_type and m.item_id = l.item_id and l.correct
    returning 1
  )
  insert into public.item_mistakes (user_id, item_type, item_id, miss_count, last_missed_at)
  select uid, item_type, item_id, 1, now() from last_answer where not correct
  on conflict (user_id, item_type, item_id)
  do update set miss_count = public.item_mistakes.miss_count + 1, last_missed_at = now();

  -- node progress
  if p_kind in ('lesson', 'review') then
    insert into public.node_progress (user_id, node_id, best_accuracy)
    values (uid, p_node_id, v_accuracy)
    on conflict (user_id, node_id) do update
      set times_completed = public.node_progress.times_completed + 1,
          last_completed_at = now(),
          best_accuracy = greatest(public.node_progress.best_accuracy, excluded.best_accuracy);
  end if;

  -- daily activity
  insert into public.daily_activity (user_id, day, xp, sessions, perfect)
  values (uid, today, v_xp, 1, case when v_perfect then 1 else 0 end)
  on conflict (user_id, day) do update
    set xp = public.daily_activity.xp + excluded.xp,
        sessions = public.daily_activity.sessions + 1,
        perfect = public.daily_activity.perfect + excluded.perfect
  returning * into v_day;

  -- streak
  if st.last_active_day is distinct from today then
    st.streak_current := case when st.last_active_day = today - 1 then st.streak_current + 1 else 1 end;
    st.last_active_day := today;
  end if;

  -- practice heals one heart
  if p_kind = 'practice' and st.hearts < 5 then
    st.hearts := st.hearts + 1; v_healed := true;
  end if;

  -- daily quests (claimed automatically, once per day each)
  select daily_goal_xp into v_goal from public.profiles where id = uid;
  with candidates(quest_id, gems, met) as (
    values ('xp', 10, v_day.xp >= v_goal),
           ('lessons', 10, v_day.sessions >= 2),
           ('perfect', 15, v_day.perfect >= 1)
  ), inserted as (
    insert into public.quest_claims (user_id, day, quest_id, gems)
    select uid, today, quest_id, gems from candidates where met
    on conflict do nothing
    returning gems
  )
  select coalesce(sum(gems), 0) into v_quest_gems from inserted;

  update public.user_stats set
    xp_total = xp_total + v_xp,
    gems = gems + v_quest_gems,
    hearts = st.hearts,
    streak_current = st.streak_current,
    streak_longest = greatest(streak_longest, st.streak_current),
    last_active_day = st.last_active_day,
    updated_at = now()
  where user_id = uid
  returning * into st;

  return jsonb_build_object(
    'session_id', v_session,
    'xp_earned', v_xp,
    'accuracy', v_accuracy,
    'perfect', v_perfect,
    'healed', v_healed,
    'quest_gems', v_quest_gems,
    'day_xp', v_day.xp,
    'stats', to_jsonb(st)
  );
end;
$$;

-- Wrong answer during a lesson or review costs a heart.
create or replace function public.lose_heart()
returns smallint
language plpgsql security definer set search_path = ''
as $$
declare h smallint;
begin
  if auth.uid() is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  update public.user_stats set hearts = greatest(0, hearts - 1), updated_at = now()
  where user_id = auth.uid() returning hearts into h;
  return h;
end;
$$;

create or replace function public.refill_hearts()
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare st public.user_stats;
begin
  if auth.uid() is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  update public.user_stats set hearts = 5, gems = gems - 50, updated_at = now()
  where user_id = auth.uid() and gems >= 50 and hearts < 5
  returning * into st;
  if not found then raise exception 'not enough gems or hearts already full' using errcode = '42501'; end if;
  return to_jsonb(st);
end;
$$;

create or replace function public.open_chest(p_node_id text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid(); st public.user_stats;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from public.path_nodes where id = p_node_id and kind = 'chest') then
    raise exception 'not a chest' using errcode = '22023';
  end if;
  if not public.node_unlocked(uid, p_node_id) then raise exception 'node locked' using errcode = '42501'; end if;
  insert into public.node_progress (user_id, node_id) values (uid, p_node_id) on conflict do nothing;
  if not found then raise exception 'chest already opened' using errcode = '23505'; end if;
  update public.user_stats set gems = gems + 20, updated_at = now() where user_id = uid returning * into st;
  return to_jsonb(st);
end;
$$;

-- Weekly league: names and XP only, no other personal data.
create or replace function public.weekly_leaderboard(p_limit int default 30)
returns table (rank bigint, display_name text, xp bigint, is_me boolean)
language sql stable security definer set search_path = ''
as $$
  select rank() over (order by sum(d.xp) desc),
         coalesce(nullif(p.display_name, ''), 'მოსწავლე'),
         sum(d.xp)::bigint,
         p.id = auth.uid()
  from public.daily_activity d
  join public.profiles p on p.id = d.user_id
  where d.day >= date_trunc('week', public.local_day(auth.uid()))::date
  group by p.id, p.display_name
  order by 3 desc
  limit least(greatest(p_limit, 1), 100);
$$;

create or replace function public.reset_my_progress()
returns void
language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  delete from public.node_progress     where user_id = uid;
  delete from public.learning_sessions where user_id = uid;
  delete from public.item_mistakes     where user_id = uid;
  delete from public.daily_activity    where user_id = uid;
  delete from public.quest_claims      where user_id = uid;
  update public.user_stats set xp_total = 0, gems = 120, hearts = 5, streak_current = 0, streak_longest = 0,
         last_active_day = null, updated_at = now() where user_id = uid;
end;
$$;

-- Required by both app stores: in-app account deletion.
create or replace function public.delete_my_account()
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- Function permissions: signed-in users only
revoke execute on function public.complete_session(public.session_kind, text, text, text[], jsonb, timestamptz) from public, anon;
revoke execute on function public.lose_heart()              from public, anon;
revoke execute on function public.refill_hearts()           from public, anon;
revoke execute on function public.open_chest(text)          from public, anon;
revoke execute on function public.weekly_leaderboard(int)   from public, anon;
revoke execute on function public.reset_my_progress()       from public, anon;
revoke execute on function public.delete_my_account()       from public, anon;
revoke execute on function public.local_day(uuid)           from public, anon, authenticated;
revoke execute on function public.node_unlocked(uuid, text) from public, anon, authenticated;
revoke execute on function public.handle_new_user()         from public, anon, authenticated;

grant execute on function public.complete_session(public.session_kind, text, text, text[], jsonb, timestamptz) to authenticated;
grant execute on function public.lose_heart()            to authenticated;
grant execute on function public.refill_hearts()         to authenticated;
grant execute on function public.open_chest(text)        to authenticated;
grant execute on function public.weekly_leaderboard(int) to authenticated;
grant execute on function public.reset_my_progress()     to authenticated;
grant execute on function public.delete_my_account()     to authenticated;
