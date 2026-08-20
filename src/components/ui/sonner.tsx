import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      closeButton
      richColors
      expand
      toastOptions={{
        classNames: {
          toast:
            [
              // Base (modern “glass”)
              "group toast",
              "group-[.toaster]:bg-background/80 group-[.toaster]:backdrop-blur-xl",
              "group-[.toaster]:text-foreground",
              "group-[.toaster]:border group-[.toaster]:border-border/60",
              "group-[.toaster]:shadow-xl group-[.toaster]:shadow-black/5 dark:group-[.toaster]:shadow-black/30",
              "rounded-xl",
              // Layout
              "gap-2 p-4",
              // Accent by type
              "data-[type=success]:border-emerald-500/30 data-[type=success]:bg-emerald-500/10",
              "data-[type=error]:border-destructive/35 data-[type=error]:bg-destructive/10",
              "data-[type=warning]:border-amber-500/35 data-[type=warning]:bg-amber-500/10",
              "data-[type=info]:border-sky-500/30 data-[type=info]:bg-sky-500/10",
            ].join(" "),
          title: "font-semibold tracking-tight",
          description: "text-sm leading-snug text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3",
          cancelButton:
            "bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg px-3",
          closeButton:
            "!left-auto !right-2 !top-2 !flex !h-6 !w-6 !items-center !justify-center !rounded-md !border !border-border !bg-background/80 !p-0 !text-foreground/70 hover:!bg-muted hover:!text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
