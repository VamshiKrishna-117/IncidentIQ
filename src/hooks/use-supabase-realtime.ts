"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

function getClient() {
  return createClient();
}

export function useRealtimeIncidents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = getClient();
    const channel = supabase
      .channel("incidents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["incidents"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useRealtimeIncidentUpdates(incidentId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = getClient();
    const channel = supabase
      .channel(`incident-updates-${incidentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "incident_updates",
          filter: `incident_id=eq.${incidentId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["incident-updates", incidentId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incidentId, queryClient]);
}
