"use client";

import { Menu, Bell, HelpCircle, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { usePathname } from "next/navigation";

export function Header() {
  const { toggleSidebar, setCreateIncidentOpen } = useUIStore();
  const pathname = usePathname();

  const pageTitles: Record<string, string> = {
    "/": "Operations Overview",
    "/dashboard": "Active Incidents",
    "/ai-assistant": "Nexus AI Analysis",
    "/infrastructure": "Service Mesh Health",
    "/analytics": "System Analytics",
    "/settings": "System Settings",
    "/support": "Support & Documentation",
  };

  const title = Object.entries(pageTitles).find(([path]) =>
    pathname === path ? true : pathname.startsWith(path) && path !== "/"
  )?.[1] ?? pageTitles["/"];

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-surface/70 backdrop-blur-xl px-4">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold text-on-surface">{title}</h1>

      <div className="hidden sm:relative sm:flex sm:flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          className="w-full rounded-lg border border-border bg-[#050505] py-1.5 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          placeholder="Search incidents..."
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateIncidentOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Incident</span>
        </Button>

        <button className="relative rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error" />
        </button>

        <button className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
