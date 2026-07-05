"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore, type ToastVariant } from "@/stores/toast-store";

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
  error: <X className="h-5 w-5 text-red-400" />,
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          open
          onOpenChange={() => removeToast(toast.id)}
          className={cn(
            "group pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-surface-container-high p-4 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full"
          )}
        >
          {iconMap[toast.variant]}
          <ToastPrimitive.Description className="flex-1 text-sm text-on-surface">
            {toast.message}
          </ToastPrimitive.Description>
          <ToastPrimitive.Close className="shrink-0 rounded p-0.5 text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="h-4 w-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-full outline-none" />
    </ToastPrimitive.Provider>
  );
}
