import { useToastStore, type ToastVariant } from "@/stores/toast-store";

export function useToast() {
  const addToast = useToastStore((s) => s.addToast);

  return {
    success: (message: string) => addToast({ message, variant: "success" }),
    warning: (message: string) => addToast({ message, variant: "warning" }),
    info: (message: string) => addToast({ message, variant: "info" }),
    error: (message: string) => addToast({ message, variant: "error" }),
  };
}
