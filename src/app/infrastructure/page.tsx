"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ServiceCard } from "@/components/infrastructure/service-card";
import { LoadingCard } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, Share2 } from "lucide-react";
import { useState } from "react";

interface ServiceRow {
  id: string;
  name: string;
  cluster: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  p99_latency_ms: number | null;
  error_rate: number | null;
  cpu_usage: number | null;
  memory_usage: number | null;
  request_rate: number | null;
  heartbeat_at: string | null;
  region: string;
}

const supabase = createClient();

type Region = "ALL" | "us-east-1" | "eu-west-2";

export default function InfrastructurePage() {
  const [region, setRegion] = useState<Region>("ALL");
  const [lastUpdated, setLastUpdated] = useState("just now");

  const { data: services, isLoading, error, refetch } = useQuery({
    queryKey: ["services", region],
    queryFn: async () => {
      let query = supabase.from("services").select("*");
      if (region !== "ALL") {
        query = query.eq("region", region);
      }
      const { data, error } = await query.order("name");
      if (error) throw error;
      setLastUpdated("just now");
      return (data ?? []) as ServiceRow[];
    },
  });

  const regions: Region[] = ["ALL", "us-east-1", "eu-west-2"];

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState
          type="error"
          title="Failed to load services"
          description="Unable to connect to the backend."
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-on-surface">Service Mesh Health</h1>
            <p className="text-sm text-on-surface-variant">Real-time telemetry and availability matrix.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-on-surface-variant" />
          <span className="text-xs text-on-surface-variant">FILTER BY:</span>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                region === r
                  ? "bg-primary text-on-primary"
                  : "border border-border text-on-surface-variant hover:bg-white/5"
              }`}
            >
              {r === "ALL" ? "ALL REGIONS" : r.toUpperCase()}
            </button>
          ))}
          <span className="ml-auto text-xs text-on-surface-variant">Last updated: {lastUpdated}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(services as ServiceRow[]).map((svc) => (
            <ServiceCard
              key={svc.id}
              name={svc.name}
              cluster={svc.cluster}
              status={svc.status}
              p99LatencyMs={svc.p99_latency_ms}
              errorRate={svc.error_rate}
              cpuUsage={svc.cpu_usage}
              memoryUsage={svc.memory_usage}
              requestRate={svc.request_rate}
              heartbeatAt={svc.heartbeat_at ? new Date(svc.heartbeat_at).toISOString() : "N/A"}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Share2 className="mb-3 h-10 w-10 text-on-surface-variant" />
          <h3 className="mb-1 text-lg font-semibold text-on-surface">No Services Found</h3>
          <p className="text-sm text-on-surface-variant">Run the seed data to populate the service mesh.</p>
        </div>
      )}
    </div>
  );
}
