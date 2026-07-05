"use client";

import { AlertTriangle, Lock, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const icons = {
  not_found: SearchX,
  access_denied: Lock,
  error: AlertTriangle,
} as const;

interface ErrorStateProps {
  type?: keyof typeof icons;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorState({ type = "error", title, description, action, className }: ErrorStateProps) {
  const Icon = icons[type];

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-container/20">
        <Icon className="h-7 w-7 text-error" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-on-surface">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-on-surface-variant">{description}</p>
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
