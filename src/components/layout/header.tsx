"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Bell, HelpCircle, Plus, Search, X, Circle, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllRead } from "@/hooks/use-notifications";
import { createClient } from "@/lib/supabase/client";
import { formatTimestamp } from "@/lib/utils";

export function Header() {
  const { toggleSidebar, setCreateIncidentOpen, globalSearch, setGlobalSearch } = useUIStore();
  const { user, openAuthModal } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateIncident = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setCreateIncidentOpen(true);
  };

  const handleSignOut = async () => {
    setShowUserMenu(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };
  const pathname = usePathname();
  const [localSearch, setLocalSearch] = useState(globalSearch);
  const isFirstRender = useRef(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { data: notifications } = useNotifications();
  const unreadCount = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setLocalSearch("");
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setLocalSearch("");
    setGlobalSearch("");
  };

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

  // ----- Mobile search overlay (renders below <sm only) -----
  if (mobileSearchOpen) {
    return (
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface/70 backdrop-blur-xl px-3 sm:hidden">
        <button onClick={closeMobileSearch} className="rounded-lg p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" aria-label="Close search">
          <X className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            ref={searchInputRef}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-[#050505] py-2 pl-9 pr-8 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
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
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-1 border-b border-border bg-surface/70 backdrop-blur-xl px-2 md:px-4 md:gap-3">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors lg:hidden cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="truncate text-sm font-semibold text-on-surface md:text-base min-w-0">{title}</h1>

      {/* Mobile search trigger — visible below sm */}
      <button
        onClick={openMobileSearch}
        className="sm:hidden rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer"
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Desktop / tablet search — visible sm and up */}
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

      <div className="ml-auto flex items-center gap-0.5 md:gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleCreateIncident}
          aria-label="Create new incident"
          className="h-9 px-2 md:px-3"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Incident</span>
        </Button>

        <div ref={notifRef} className="relative">
          <button onClick={() => setShowNotifications((prev) => !prev)} className="relative rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold text-on-error">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-16px)] rounded-xl border border-border bg-surface shadow-xl z-50">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <h3 className="text-xs font-semibold text-on-surface">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={() => markAllRead.mutate()} className="text-[10px] text-primary hover:text-primary/80 transition-colors cursor-pointer">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {!notifications || notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-on-surface-variant">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { if (!n.read) markRead.mutate(n.id); }}
                      className={`w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        !n.read ? "bg-white/[0.03]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <Circle className="h-2 w-2 mt-1 shrink-0 fill-primary text-primary" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-on-surface">{n.title}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-on-surface-variant/50 mt-0.5">{formatTimestamp(n.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={userMenuRef} className="relative">
          {user ? (
            <button onClick={() => setShowUserMenu((prev) => !prev)} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" aria-label="User menu">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
            </button>
          ) : (
            <button onClick={() => openAuthModal()} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" aria-label="Sign in">
              <Shield className="h-5 w-5" />
            </button>
          )}
          {showUserMenu && user && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-surface shadow-xl z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-on-surface truncate">{user.email}</p>
              </div>
              <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-on-surface-variant hover:bg-white/[0.02] transition-colors cursor-pointer">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        <button onClick={() => router.push("/support")} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
