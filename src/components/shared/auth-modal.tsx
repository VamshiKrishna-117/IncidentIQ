"use client";

import { useRouter, usePathname } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Shield } from "lucide-react";

export function AuthModal() {
  const { showAuthModal, closeAuthModal } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const redirectTo = (page: string) => {
    closeAuthModal();
    router.push(`${page}?redirect=${encodeURIComponent(pathname)}`);
  };

  return (
    <Modal open={showAuthModal} onOpenChange={(open) => { if (!open) closeAuthModal(); }} title="Sign in to continue">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">
          You&apos;re currently exploring the public demo of IncidentIQ. Sign in or create an account to create, edit, upload, and manage your own incidents while continuing to explore the demo data.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={() => redirectTo("/login")}>
          Sign In
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => redirectTo("/signup")}>
          Create Account
        </Button>
        <Button variant="ghost" className="w-full" onClick={closeAuthModal}>
          Continue Exploring
        </Button>
      </div>
    </Modal>
  );
}
