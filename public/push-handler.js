self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = {
      title: "Harmony OS",
      body: event.data?.text() ?? "Tienes un nuevo aviso.",
      href: "/dashboard",
    };
  }

  const title = payload.title || "Harmony OS";
  const body = payload.body || "Tienes un nuevo aviso.";
  const href = payload.href || "/dashboard";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/pwa/icon/192",
      badge: "/pwa/icon/192",
      tag: payload.tag || undefined,
      data: { href },
    }),
  );
});
