"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, AlertTriangle, Brain, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const mobileItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard", icon: AlertTriangle, label: "Incidents" },
  { href: "/ai-assistant", icon: Brain, label: "AI" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setCreateIncidentOpen } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-surface/90 backdrop-blur-xl lg:hidden">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={() => setCreateIncidentOpen(true)}
        className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary mb-0.5">
          <span className="text-sm font-bold text-on-primary">+</span>
        </div>
        New
      </button>
    </nav>
  );
}
