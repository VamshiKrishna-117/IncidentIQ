import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./use-toast";

const supabase = createClient();

export interface SettingsMap {
  theme: string;
  notifications_enabled: boolean;
  auto_refresh_interval: string;
  websocket_endpoint: string;
  max_reconnection_retries: number;
  ai_provider: string;
  auto_analyze_critical: boolean;
  [key: string]: string | number | boolean;
}

const DEFAULTS: SettingsMap = {
  theme: "dark",
  notifications_enabled: true,
  auto_refresh_interval: "15s",
  websocket_endpoint: "wss://stream.aegis.internal",
  max_reconnection_retries: 5,
  ai_provider: "groq",
  auto_analyze_critical: true,
};

function getLocalSettings(): SettingsMap {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem("incidentiq-settings");
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function setLocalSettings(settings: SettingsMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem("incidentiq-settings", JSON.stringify(settings));
}

export function useSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const query = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const local = getLocalSettings();
      const { data } = await supabase.from("settings").select("*");
      if (data && data.length > 0) {
        const db: SettingsMap = { ...DEFAULTS };
        for (const row of data) {
          const val = row.value;
          if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
            db[row.key] = val;
          } else if (typeof val === "object") {
            db[row.key] = val;
          }
        }
        setLocalSettings(db);
        return db;
      }
      return local;
    },
    staleTime: 60000,
  });

  const saveMutation = useMutation({
    mutationFn: async (settings: SettingsMap) => {
      setLocalSettings(settings);
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from("settings").upsert(
          { key, value: JSON.stringify(value) },
          { onConflict: "key" }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  return { settings: query.data ?? getLocalSettings(), isLoading: query.isLoading, save: saveMutation.mutate, isSaving: saveMutation.isPending };
}
