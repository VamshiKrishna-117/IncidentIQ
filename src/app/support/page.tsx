"use client";

import { LifeBuoy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-on-surface">Support & Documentation</h1>
        <p className="text-sm text-on-surface-variant">
          Help resources and system documentation.
        </p>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          <LifeBuoy className="mx-auto mb-3 h-8 w-8 text-on-surface-variant" />
          <p className="text-sm text-on-surface-variant">
            Support center will be available in Phase 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
