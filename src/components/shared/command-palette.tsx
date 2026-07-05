"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Command, ArrowRight, X, Star, FileText, Settings, LifeBuoy, BarChart3, Wifi, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PAGES = [
  { label: "Dashboard", href: "/", icon: Star },
  { label: "Incidents", href: "/incidents", icon: FileText },
  { label: "Infrastructure", href: "/infrastructure", icon: Wifi },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "AI Assistant", href: "/ai-assistant", icon: Brain },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help & Support", href: "/support", icon: LifeBuoy },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filtered = query.trim()
    ? PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
    : PAGES;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].href);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-surface-container-high shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-on-surface-variant shrink-0" />
          <input
            autoFocus
            placeholder="Search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
          />
          <kbd className="hidden items-center gap-0.5 rounded border border-border bg-[#050505] px-1.5 py-0.5 text-[10px] text-on-surface-variant sm:flex">
            <Command className="h-2.5 w-2.5" />
            K
          </kbd>
          <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">No results found.</p>
          ) : (
            filtered.map((page, i) => {
              const Icon = page.icon;
              return (
                <button
                  key={page.href}
                  onClick={() => navigate(page.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    i === selectedIndex ? "bg-white/5 text-on-surface" : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.02]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{page.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
