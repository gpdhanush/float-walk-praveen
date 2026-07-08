import { useEffect, useMemo, useState } from "react";
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

export function PwaInstallDialog() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);

  const canInstall = useMemo(() => !!deferred && !installed, [deferred, installed]);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setOpen(true);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    // If already installed (display-mode standalone), don't show.
    const mq = window.matchMedia?.("(display-mode: standalone)");
    if (mq?.matches) setInstalled(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setOpen(false);
      }
    } finally {
      setDeferred(null);
    }
  };

  if (!canInstall) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button variant="outline" onClick={() => setOpen(false)}>
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

