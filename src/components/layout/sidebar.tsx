"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  Brain,
  Share2,
  BarChart3,
  Settings,
  LifeBuoy,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard", icon: AlertTriangle, label: "Incidents", badge: "2" },
  { href: "/ai-assistant", icon: Brain, label: "AI Assistant" },
  { href: "/infrastructure", icon: Share2, label: "Infrastructure" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/support", icon: LifeBuoy, label: "Support" },
];

interface SidebarProps {
  open: boolean;
}

export function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-full flex-col border-r border-border bg-surface/70 backdrop-blur-xl transition-all duration-300",
        open ? "w-60" : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
      )}
    >
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-on-primary" />
        </div>
        <span
          className={cn(
            "text-sm font-semibold text-on-surface transition-opacity",
            !open && "lg:hidden"
          )}
        >
          Aegis Sentinel
        </span>
        <span
          className={cn(
            "ml-auto rounded bg-surface-container-higher px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant transition-opacity",
            !open && "lg:hidden"
          )}
        >
          v2.4.0-prod
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-on-surface"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={cn("transition-opacity", !open && "lg:hidden")}>
                {item.label}
              </span>
              {item.badge && (
                <span
                  className={cn(
                    "ml-auto rounded-full bg-error-container/30 px-2 py-0.5 text-[10px] font-medium text-error transition-opacity",
                    !open && "lg:hidden"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
