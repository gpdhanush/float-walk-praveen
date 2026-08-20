import * as React from "react";
import { Toast, Toaster as ArkToaster, createToaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning" | "default";

type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: ToastType;
  duration?: number;
};

const toaster = createToaster({
  placement: "bottom-end",
  gap: 16,
  overlap: true,
});

const createToast = (
  type: ToastType,
  title: React.ReactNode,
  description?: React.ReactNode,
  options: ToastOptions = {},
) => toaster.create({ title, description, type, ...options });

const toast = {
  success: (title: React.ReactNode, description?: React.ReactNode, options: Omit<ToastOptions, "type"> = {}) =>
    createToast("success", title, description, options),
  error: (title: React.ReactNode, description?: React.ReactNode, options: Omit<ToastOptions, "type"> = {}) =>
    createToast("error", title, description, options),
  info: (title: React.ReactNode, description?: React.ReactNode, options: Omit<ToastOptions, "type"> = {}) =>
    createToast("info", title, description, options),
  warning: (title: React.ReactNode, description?: React.ReactNode, options: Omit<ToastOptions, "type"> = {}) =>
    createToast("warning", title, description, options),
  message: (title: React.ReactNode, description?: React.ReactNode, options: Omit<ToastOptions, "type"> = {}) =>
    createToast("default", title, description, options),
  dismiss: (id?: string) => (id ? toaster.dismiss(id) : toaster.dismiss()),
};

export function Toaster() {
  return (
    <Portal>
      <ArkToaster toaster={toaster}>
        {(toastItem) => (
          <Toast.Root
            key={toastItem.id}
            className="pointer-events-auto relative min-w-[20rem] max-w-[calc(100vw-2rem)] overflow-anywhere rounded-lg border border-gray-100 bg-white p-4 shadow-md transition-all duration-300 ease-out will-change-transform h-[var(--height)] opacity-[var(--opacity)] translate-x-[var(--x)] translate-y-[var(--y)] scale-[var(--scale)] z-[var(--z-index)] dark:border-gray-700 dark:bg-gray-800"
          >
            <Toast.Title className="pr-6 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {toastItem.title}
            </Toast.Title>
            <Toast.Description className="mt-1 pr-6 text-sm text-gray-600 dark:text-gray-300">
              {toastItem.description}
            </Toast.Description>
            <Toast.CloseTrigger className="absolute right-3 top-3 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200">
              <X className="h-3 w-3" />
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </ArkToaster>
    </Portal>
  );
}

export { toast };
