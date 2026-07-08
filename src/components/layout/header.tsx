"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Bell, HelpCircle, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { toggleSidebar, setCreateIncidentOpen, globalSearch, setGlobalSearch } = useUIStore();
  const router = useRouter();
  const toast = useToast();
  const pathname = usePathname();
  const [localSearch, setLocalSearch] = useState(globalSearch);
  const isFirstRender = useRef(true);

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

  useEffect(() => {
    setLocalSearch(globalSearch);
  }, [pathname, globalSearch]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const trimmed = localSearch.trim();
      setGlobalSearch(trimmed);
      if (pathname !== "/dashboard") {
        if (trimmed) {
          router.push(`/dashboard?q=${encodeURIComponent(trimmed)}`);
        }
      } else {
        const params = new URLSearchParams(window.location.search);
        if (trimmed) {
          params.set("q", trimmed);
        } else {
          params.delete("q");
        }
        const qs = params.toString();
        router.replace(`/dashboard${qs ? `?${qs}` : ""}`);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, pathname, router, setGlobalSearch]);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface/70 backdrop-blur-xl px-3 md:px-4">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="truncate text-sm font-semibold text-on-surface md:text-base">{title}</h1>

      <div className="hidden sm:relative sm:flex sm:flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-[#050505] py-1.5 pl-9 pr-8 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          placeholder="Search incidents..."
          aria-label="Search incidents"
        />
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(""); setGlobalSearch(""); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateIncidentOpen(true)}
          aria-label="Create new incident"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Incident</span>
        </Button>

        <button onClick={() => toast.info("No new notifications")} className="relative rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error" aria-hidden="true" />
        </button>

        <button onClick={() => router.push("/support")} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
