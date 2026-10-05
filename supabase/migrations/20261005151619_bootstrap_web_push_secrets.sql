create table if not exists public.push_public_config (
  id boolean primary key default true check (id),
  vapid_public text not null,
  updated_at timestamptz not null default now()
);

alter table public.push_public_config enable row level security;

drop policy if exists push_public_config_read on public.push_public_config;
create policy push_public_config_read
on public.push_public_config
for select to authenticated
using (true);

create or replace function public.store_harmony_push_secrets(
  p_public text,
  p_private text,
  p_cron text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if current_user not in ('service_role', 'postgres') then
    raise exception 'No autorizado';
  end if;

  select id into v_id
  from vault.secrets
  where name = 'harmony_web_push_vapid_private';

  if v_id is null then
    perform vault.create_secret(
      p_private,
      'harmony_web_push_vapid_private',
      'Harmony Web Push VAPID private key'
    );
  else
    perform vault.update_secret(
      v_id,
      p_private,
      'harmony_web_push_vapid_private',
      'Harmony Web Push VAPID private key'
    );
  end if;

  select id into v_id
  from vault.secrets
  where name = 'harmony_web_push_cron_token';

  if v_id is null then
    perform vault.create_secret(
      p_cron,
      'harmony_web_push_cron_token',
      'Harmony Web Push cron authentication token'
    );
  else
    perform vault.update_secret(
      v_id,
      p_cron,
      'harmony_web_push_cron_token',
      'Harmony Web Push cron authentication token'
    );
  end if;

  insert into public.push_public_config(id, vapid_public, updated_at)
  values (true, p_public, now())
  on conflict (id) do update
  set vapid_public = excluded.vapid_public,
      updated_at = now();
end;
$$;

revoke all on function public.store_harmony_push_secrets(text, text, text)
from public, anon, authenticated;
grant execute on function public.store_harmony_push_secrets(text, text, text)
to service_role;
