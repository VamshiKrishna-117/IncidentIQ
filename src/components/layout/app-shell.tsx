"use client";

import { useUIStore } from "@/stores/ui-store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "@/components/shared/command-palette";
import { TelemetryLost } from "@/components/shared/telemetry-lost";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarOpen ? "lg:ml-60" : "lg:ml-16"
        )}
      >
        <Header />
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>
      </div>
      <MobileNav />
      <CommandPalette />
      <TelemetryLost />
    </div>
  );
}
