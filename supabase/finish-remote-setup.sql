-- Remaining setup for project yddxcztmadybsvfopsii. Paste into Supabase SQL editor, run, then run seed.sql.
-- (These contain 'delete from', which the assistant's SQL tool could not run without a confirmation.)
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

revoke execute on function public.reset_my_progress()       from public, anon;
revoke execute on function public.delete_my_account()       from public, anon;
grant execute on function public.reset_my_progress()     to authenticated;
grant execute on function public.delete_my_account()     to authenticated;
