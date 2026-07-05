"use client";

import { Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-on-surface">System Settings</h1>
        <p className="text-sm text-on-surface-variant">
          Configure Aegis Sentinel operational parameters and AI preferences.
        </p>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          <Settings className="mx-auto mb-3 h-8 w-8 text-on-surface-variant" />
          <p className="text-sm text-on-surface-variant">
            Settings panel will be available in Phase 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
