"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastContainer } from "@/components/ui/toast";
import { AppShell } from "@/components/layout/app-shell";
import { CreateIncidentModal } from "@/components/incidents/create-incident-modal";
import { ThemeProvider } from "@/components/theme-provider";
import { RealtimeProvider } from "@/components/realtime-provider";
import { AuthProvider } from "@/components/auth-provider";
import { AuthModal } from "@/components/shared/auth-modal";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RealtimeProvider>
            <AppShell>
              {children}
              <CreateIncidentModal />
            </AppShell>
            <AuthModal />
            <ToastContainer />
          </RealtimeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
