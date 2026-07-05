"use client";

import { Share2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function InfrastructurePage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-on-surface">Service Mesh Health</h1>
        <p className="text-sm text-on-surface-variant">
          Real-time telemetry and availability matrix.
        </p>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          <Share2 className="mx-auto mb-3 h-8 w-8 text-on-surface-variant" />
          <p className="text-sm text-on-surface-variant">
            Service health monitoring will be available after infrastructure setup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
