create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_success_at timestamptz,
  last_error text
);

alter table public.web_push_subscriptions enable row level security;

drop policy if exists web_push_select_own on public.web_push_subscriptions;
create policy web_push_select_own on public.web_push_subscriptions
for select to authenticated using (user_id = auth.uid());

drop policy if exists web_push_insert_own on public.web_push_subscriptions;
create policy web_push_insert_own on public.web_push_subscriptions
for insert to authenticated with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.household_members hm
    where hm.user_id = auth.uid()
      and hm.household_id = web_push_subscriptions.household_id
  )
);

drop policy if exists web_push_update_own on public.web_push_subscriptions;
create policy web_push_update_own on public.web_push_subscriptions
for update to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.household_members hm
    where hm.user_id = auth.uid()
      and hm.household_id = web_push_subscriptions.household_id
  )
);

drop policy if exists web_push_delete_own on public.web_push_subscriptions;
create policy web_push_delete_own on public.web_push_subscriptions
for delete to authenticated using (user_id = auth.uid());

create index if not exists idx_web_push_subscriptions_user
  on public.web_push_subscriptions(user_id);
create index if not exists idx_web_push_subscriptions_household
  on public.web_push_subscriptions(household_id);

create or replace function private.prepare_push_subscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_household uuid;
begin
  if v_user is null then
    raise exception 'No autenticado';
  end if;

  select hm.household_id into v_household
  from public.household_members hm
  where hm.user_id = v_user
  limit 1;

  if v_household is null then
    raise exception 'No perteneces a un hogar';
  end if;

  delete from public.web_push_subscriptions
  where endpoint = new.endpoint
    and user_id <> v_user;

  new.user_id := v_user;
  new.household_id := v_household;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.prepare_push_subscription()
from public, anon, authenticated;

drop trigger if exists prepare_push_subscription on public.web_push_subscriptions;
create trigger prepare_push_subscription
before insert on public.web_push_subscriptions
for each row execute function private.prepare_push_subscription();

alter table public.notifications
  add column if not exists push_sent_at timestamptz,
  add column if not exists push_attempted_at timestamptz,
  add column if not exists push_attempts integer not null default 0;

create index if not exists idx_notifications_push_pending
  on public.notifications(recipient_user_id, created_at)
  where push_sent_at is null;

create or replace function public.get_harmony_push_secrets()
returns table(vapid_private text, cron_token text)
language sql
security definer
set search_path = ''
as $$
  select
    max(ds.decrypted_secret) filter (
      where ds.name = 'harmony_web_push_vapid_private'
    ) as vapid_private,
    max(ds.decrypted_secret) filter (
      where ds.name = 'harmony_web_push_cron_token'
    ) as cron_token
  from vault.decrypted_secrets ds;
$$;

revoke all on function public.get_harmony_push_secrets()
from public, anon, authenticated;
grant execute on function public.get_harmony_push_secrets() to service_role;
