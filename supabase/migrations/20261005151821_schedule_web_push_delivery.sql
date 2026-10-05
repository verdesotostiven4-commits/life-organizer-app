do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid
  from cron.job
  where jobname = 'harmony-push-delivery'
  limit 1;

  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
end
$$;

select cron.schedule(
  'harmony-push-delivery',
  '* * * * *',
  $job$
    select net.http_post(
      url := 'https://cgahsgofgslrjukvtesw.supabase.co/functions/v1/send-push-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-harmony-cron',
        (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'harmony_web_push_cron_token'
          limit 1
        )
      ),
      body := '{}'::jsonb
    );
  $job$
);
