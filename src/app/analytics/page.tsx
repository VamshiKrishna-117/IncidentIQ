"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-on-surface">System Analytics</h1>
        <p className="text-sm text-on-surface-variant">
          Real-time telemetry and incident resolution metrics.
        </p>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          <BarChart3 className="mx-auto mb-3 h-8 w-8 text-on-surface-variant" />
          <p className="text-sm text-on-surface-variant">
            Analytics will be available after sufficient incident data is collected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
