"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  RefreshCw,
  WifiOff,
  X,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const INSTALL_DISMISS_KEY = "harmony:pwa-install-dismissed-at";
const INSTALL_DISMISS_MS = 3 * 24 * 60 * 60 * 1000;

function isStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS compatibility. Harmless on browsers where it does not exist.
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function PWAController() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [online, setOnline] = useState(true);
  const refreshingRef = useRef(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();

      if (isStandalone()) return;

      const dismissedAt = Number(
        window.localStorage.getItem(INSTALL_DISMISS_KEY) ?? "0",
      );

      setInstallPrompt(event as BeforeInstallPromptEvent);

      if (Date.now() - dismissedAt > INSTALL_DISMISS_MS) {
        setShowInstall(true);
      }
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setShowInstall(false);
      window.localStorage.removeItem(INSTALL_DISMISS_KEY);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let active = true;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (!active) return;

        registrationRef.current = registration;

        if (registration.waiting) {
          setUpdateReady(true);
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateReady(true);
            }
          });
        });

        const checkForUpdate = () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => undefined);
          }
        };

        document.addEventListener("visibilitychange", checkForUpdate);
        window.addEventListener("focus", checkForUpdate);

        return () => {
          document.removeEventListener("visibilitychange", checkForUpdate);
          window.removeEventListener("focus", checkForUpdate);
        };
      } catch (error) {
        console.error("No se pudo registrar el service worker:", error);
        return undefined;
      }
    };

    let removeUpdateListeners: (() => void) | undefined;

    register().then((cleanup) => {
      removeUpdateListeners = cleanup;
    });

    const handleControllerChange = () => {
      if (!refreshingRef.current) return;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      active = false;
      removeUpdateListeners?.();
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setShowInstall(false);
      setInstallPrompt(null);
    }
  };

  const dismissInstall = () => {
    setShowInstall(false);
    window.localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
  };

  const applyUpdate = () => {
    const waiting = registrationRef.current?.waiting;
    if (!waiting) {
      registrationRef.current?.update().catch(() => undefined);
      return;
    }

    refreshingRef.current = true;
    waiting.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <>
      {!online ? (
        <div
          className="fixed left-1/2 top-[max(12px,env(safe-area-inset-top))] z-[220] flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-200 bg-amber-50/95 px-3 py-2 text-[11px] font-black text-amber-800 shadow-lg backdrop-blur"
          role="status"
        >
          <WifiOff className="h-3.5 w-3.5" />
          Sin conexión
        </div>
      ) : null}

      {updateReady ? (
        <div className="fixed bottom-[calc(5.7rem+env(safe-area-inset-bottom))] left-3 right-3 z-[210] rounded-2xl border border-purple-100 bg-white p-3 shadow-[0_18px_55px_rgba(76,29,149,.18)] lg:bottom-5 lg:left-auto lg:right-5 lg:w-[360px]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <RefreshCw className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-950">
                Nueva versión disponible
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                Actualiza Harmony sin reinstalar la app.
              </p>
              <button
                type="button"
                onClick={applyUpdate}
                className="mt-2 min-h-9 rounded-xl bg-purple-600 px-3 text-[11px] font-black text-white hover:bg-purple-700"
              >
                Actualizar ahora
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showInstall && installPrompt && !updateReady ? (
        <div className="fixed bottom-[calc(5.7rem+env(safe-area-inset-bottom))] left-3 right-3 z-[205] rounded-2xl border border-purple-100 bg-white p-3 shadow-[0_18px_55px_rgba(76,29,149,.16)] lg:bottom-5 lg:left-auto lg:right-5 lg:w-[380px]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Download className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-950">
                Instalar Harmony OS
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                Ábrelo como una app desde Android o tu PC, sin perder la sincronización.
              </p>
              <button
                type="button"
                onClick={install}
                className="mt-2 min-h-9 rounded-xl bg-purple-600 px-3 text-[11px] font-black text-white hover:bg-purple-700"
              >
                Instalar app
              </button>
            </div>
            <button
              type="button"
              onClick={dismissInstall}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              aria-label="Cerrar sugerencia de instalación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
