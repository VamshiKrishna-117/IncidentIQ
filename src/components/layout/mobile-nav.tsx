"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, AlertTriangle, Brain, Share2, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const mobileItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard", icon: AlertTriangle, label: "Incidents" },
  { href: "/ai-assistant", icon: Brain, label: "AI" },
  { href: "/infrastructure", icon: Share2, label: "Mesh" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setCreateIncidentOpen, setSidebarOpen } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-surface/90 backdrop-blur-xl lg:hidden safe-area-bottom" role="navigation" aria-label="Mobile navigation">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-medium transition-colors min-w-0",
              isActive
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span className="truncate max-w-full">{item.label}</span>
          </Link>
        );
      })}
      <button
        onClick={() => setCreateIncidentOpen(true)}
        aria-label="Create new incident"
        className="flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary mb-0.5">
          <span className="text-sm font-bold text-on-primary" aria-hidden="true">+</span>
        </div>
        New
      </button>
    </nav>
  );
}
