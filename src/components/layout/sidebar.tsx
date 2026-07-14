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
import { useUIStore } from "@/stores/ui-store";
import { useEffect } from "react";

const topNavItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard", icon: AlertTriangle, label: "Incidents", badge: "2" },
  { href: "/ai-assistant", icon: Brain, label: "AI Assistant" },
  { href: "/infrastructure", icon: Share2, label: "Infrastructure" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

const bottomNavItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/support", icon: LifeBuoy, label: "Support" },
];

interface SidebarProps {
  open: boolean;
}

export function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setSidebarOpen]);

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed left-0 top-0 z-30 flex h-full flex-col border-r border-border bg-surface/70 backdrop-blur-xl transition-all duration-300",
          open ? "w-60 translate-x-0" : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center gap-3 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-on-primary" />
          </div>
          <span
            className={cn(
              "text-sm font-semibold text-on-surface transition-opacity whitespace-nowrap",
              !open && "lg:hidden"
            )}
          >
            IncidentIQ
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" role="navigation">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-white/10 text-on-surface"
                    : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
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

        <div className="border-t border-border px-3 py-3 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-white/10 text-on-surface"
                    : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className={cn("transition-opacity", !open && "lg:hidden")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
