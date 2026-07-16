"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

async function checkAdmin(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAdmin } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async (response: { data: { user: User | null } }) => {
      const user = response?.data?.user ?? null;
      setUser(user);
      if (user) {
        const admin = await checkAdmin(user.id);
        setAdmin(admin);
      } else {
        setAdmin(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        const user = session?.user ?? null;
        setUser(user);
        if (user) {
          const admin = await checkAdmin(user.id);
          setAdmin(admin);
        } else {
          setAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setAdmin]);

  return <>{children}</>;
}
