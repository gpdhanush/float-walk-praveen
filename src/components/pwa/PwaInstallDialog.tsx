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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install Float Walk</DialogTitle>
          <DialogDescription>
            Install this app for faster access and a full-screen experience.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
          <div className="font-medium">What you get</div>
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>Home-screen icon and standalone app</li>
            <li>Faster startup with cached assets</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={dismiss}>
            Not now
          </Button>
          <Button onClick={handleInstall} className="gap-2">
            <Download className="h-4 w-4" />
            Install
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
