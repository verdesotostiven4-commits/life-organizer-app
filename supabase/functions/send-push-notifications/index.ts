import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type NotificationRow = {
  id: string;
  household_id: string;
  recipient_user_id: string;
  title: string;
  body: string;
  href: string;
  created_at: string;
  push_attempts: number;
};

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
  const key = modern
    ? JSON.parse(modern).default
    : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function minutesNow(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function timeMinutes(value: string | null | undefined, fallback: number) {
  if (!value) return fallback;
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return fallback;
  return hour * 60 + minute;
}

function quietNow(
  timeZone: string,
  quietStart?: string | null,
  quietEnd?: string | null,
) {
  const now = minutesNow(timeZone);
  const start = timeMinutes(quietStart, 21 * 60 + 30);
  const end = timeMinutes(quietEnd, 7 * 60);

  if (start === end) return false;
  if (start < end) return now >= start && now < end;
  return now >= start || now < end;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const admin = adminClient();
  const { data: secretRows, error: secretError } = await admin.rpc(
    "get_harmony_push_secrets",
  );

  if (secretError) {
    console.error("push secret lookup failed", secretError);
    return Response.json({ error: "Secret lookup failed" }, { status: 500 });
  }

  const vapidPrivate = secretRows?.[0]?.vapid_private ?? null;
  const cronToken = secretRows?.[0]?.cron_token ?? null;

  if (!vapidPrivate || !cronToken) {
    const generated = webpush.generateVAPIDKeys();
    const { error: storeError } = await admin.rpc(
      "store_harmony_push_secrets",
      {
        p_public: generated.publicKey,
        p_private: generated.privateKey,
        p_cron: randomToken(),
      },
    );

    if (storeError) {
      console.error("push bootstrap failed", storeError);
      return Response.json({ error: "Bootstrap failed" }, { status: 500 });
    }

    return Response.json({ ok: true, bootstrapped: true });
  }

  if (req.headers.get("x-harmony-cron") !== cronToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: config, error: configError } = await admin
    .from("push_public_config")
    .select("vapid_public")
    .eq("id", true)
    .maybeSingle();

  if (configError || !config?.vapid_public) {
    return Response.json({ error: "Push config unavailable" }, { status: 500 });
  }

  webpush.setVapidDetails(
    "mailto:admin@example.com",
    config.vapid_public,
    vapidPrivate,
  );

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error: queueError } = await admin
    .from("notifications")
    .select(
      "id, household_id, recipient_user_id, title, body, href, created_at, push_attempts",
    )
    .is("push_sent_at", null)
    .gte("created_at", cutoff)
    .lt("push_attempts", 5)
    .order("created_at", { ascending: true })
    .limit(50);

  if (queueError) {
    console.error("push queue fetch failed", queueError);
    return Response.json({ error: "Queue fetch failed" }, { status: 500 });
  }

  const queue = (data ?? []) as NotificationRow[];
  if (queue.length === 0) {
    return Response.json({ ok: true, processed: 0, sent: 0 });
  }

  const userIds = [...new Set(queue.map((item) => item.recipient_user_id))];
  const householdIds = [...new Set(queue.map((item) => item.household_id))];

  const [{ data: prefs }, { data: households }] = await Promise.all([
    admin
      .from("notification_preferences")
      .select("user_id, enabled, quiet_start, quiet_end")
      .in("user_id", userIds),
    admin
      .from("households")
      .select("id, timezone")
      .in("id", householdIds),
  ]);

  const prefMap = new Map((prefs ?? []).map((row) => [row.user_id, row]));
  const zoneMap = new Map(
    (households ?? []).map((row) => [
      row.id,
      row.timezone || "America/Guayaquil",
    ]),
  );

  let processed = 0;
  let sent = 0;
  let deferred = 0;
  let removedSubscriptions = 0;

  for (const notification of queue) {
    const preference = prefMap.get(notification.recipient_user_id);
    const zone =
      zoneMap.get(notification.household_id) ?? "America/Guayaquil";

    if (preference?.enabled === false) {
      const now = new Date().toISOString();
      await admin
        .from("notifications")
        .update({
          push_sent_at: now,
          push_attempted_at: now,
          push_attempts: (notification.push_attempts ?? 0) + 1,
        })
        .eq("id", notification.id);
      processed += 1;
      continue;
    }

    if (quietNow(zone, preference?.quiet_start, preference?.quiet_end)) {
      deferred += 1;
      continue;
    }

    const { data: rows, error: subError } = await admin
      .from("web_push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", notification.recipient_user_id);

    if (subError) {
      console.error("subscription lookup failed", subError);
      continue;
    }

    const subscriptions = (rows ?? []) as SubscriptionRow[];
    const attemptedAt = new Date().toISOString();

    if (subscriptions.length === 0) {
      await admin
        .from("notifications")
        .update({
          push_sent_at: attemptedAt,
          push_attempted_at: attemptedAt,
          push_attempts: (notification.push_attempts ?? 0) + 1,
        })
        .eq("id", notification.id);
      processed += 1;
      continue;
    }

    let successCount = 0;
    let retryableCount = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: notification.title,
            body: notification.body,
            href: notification.href,
            tag: notification.id,
          }),
          { TTL: 300, urgency: "normal" },
        );

        successCount += 1;
        await admin
          .from("web_push_subscriptions")
          .update({
            last_success_at: new Date().toISOString(),
            last_error: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subscription.id);
      } catch (error) {
        const statusCode =
          typeof error === "object" && error !== null && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : 0;

        if (statusCode === 404 || statusCode === 410) {
          removedSubscriptions += 1;
          await admin
            .from("web_push_subscriptions")
            .delete()
            .eq("id", subscription.id);
        } else {
          retryableCount += 1;
          await admin
            .from("web_push_subscriptions")
            .update({
              last_error:
                error instanceof Error
                  ? error.message.slice(0, 500)
                  : "Push delivery failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", subscription.id);
        }
      }
    }

    const patch: Record<string, unknown> = {
      push_attempted_at: attemptedAt,
      push_attempts: (notification.push_attempts ?? 0) + 1,
    };

    if (successCount > 0 || retryableCount === 0) {
      patch.push_sent_at = attemptedAt;
      sent += successCount;
    }

    await admin.from("notifications").update(patch).eq("id", notification.id);
    processed += 1;
  }

  return Response.json({
    ok: true,
    processed,
    sent,
    deferred,
    removedSubscriptions,
  });
});
