import { useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_KEY = "pwa_install_dismissed_v1";

function isDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

function isStandalone() {
  const mq = window.matchMedia?.("(display-mode: standalone)");
  // iOS Safari
  const iosStandalone = (navigator as any).standalone === true;
  return !!mq?.matches || iosStandalone;
}

export function PwaInstallDialog() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(() =>
    typeof window !== "undefined" ? isStandalone() : false,
  );
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== "undefined" ? isDismissed() : false,
  );
  const shownOnceRef = useRef(false);

  const canInstall = useMemo(
    () => !!deferred && !installed && !dismissed,
    [deferred, installed, dismissed],
  );

  const dismiss = () => {
    markDismissed();
    setDismissed(true);
    setOpen(false);
    setDeferred(null);
  };

  useEffect(() => {
    if (installed || dismissed || isDismissed()) return;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (isDismissed() || installed || shownOnceRef.current) return;

      setDeferred(e as BeforeInstallPromptEvent);
      shownOnceRef.current = true;
      setOpen(true);
    };

    const onAppInstalled = () => {
      markDismissed();
      setInstalled(true);
      setDismissed(true);
      setDeferred(null);
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [installed, dismissed]);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        markDismissed();
        setDismissed(true);
        setOpen(false);
      } else {
        // User cancelled browser install prompt → treat as dismissed
        dismiss();
      }
    } finally {
      setDeferred(null);
    }
  };

  if (!canInstall) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) dismiss();
        else setOpen(true);
      }}
    >
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/65 p-6 text-slate-900 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-100 dark:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)]">
        <DialogHeader className="relative">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-100/70 text-sky-700 shadow-inner dark:border-sky-300/20 dark:bg-sky-400/15 dark:text-sky-200">
            <Download className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl tracking-tight dark:text-slate-100">Install Float Walk</DialogTitle>
          <DialogDescription className="max-w-sm text-slate-600 dark:text-slate-300">
            Install this app for faster access and a full-screen experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-2xl border border-white/70 bg-white/35 p-4 text-sm shadow-inner dark:border-white/10 dark:bg-white/[0.06]">
          <div className="font-semibold text-slate-800 dark:text-slate-100">What you get</div>
          <ul className="list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-300">
            <li>Home-screen icon and standalone app</li>
            <li>Faster startup with cached assets</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={dismiss} className="border-white/70 bg-white/45 text-slate-700 hover:bg-white/70 hover:text-slate-900 dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white">
            Not now
          </Button>
          <Button onClick={handleInstall} className="gap-2 border border-sky-300/30 bg-sky-600 text-white shadow-lg shadow-sky-900/15 hover:bg-sky-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
            <Download className="h-4 w-4" />
            Install
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
