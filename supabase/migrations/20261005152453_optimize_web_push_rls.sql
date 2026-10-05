drop policy if exists web_push_select_own on public.web_push_subscriptions;
create policy web_push_select_own
on public.web_push_subscriptions
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists web_push_insert_own on public.web_push_subscriptions;
create policy web_push_insert_own
on public.web_push_subscriptions
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.household_members hm
    where hm.user_id = (select auth.uid())
      and hm.household_id = web_push_subscriptions.household_id
  )
);

drop policy if exists web_push_update_own on public.web_push_subscriptions;
create policy web_push_update_own
on public.web_push_subscriptions
for update
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.household_members hm
    where hm.user_id = (select auth.uid())
      and hm.household_id = web_push_subscriptions.household_id
  )
);

drop policy if exists web_push_delete_own on public.web_push_subscriptions;
create policy web_push_delete_own
on public.web_push_subscriptions
for delete
to authenticated
using (user_id = (select auth.uid()));
