"use client";

import { Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AIAssistantPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <Brain className="h-5 w-5 text-green-400" />
          <h1 className="text-lg font-semibold text-on-surface">Nexus AI Analysis</h1>
        </div>
        <p className="text-sm text-on-surface-variant">
          Real-time incident intelligence and mitigation strategy generation.
        </p>
      </div>

      <div className="mb-4">
        <Button variant="secondary" disabled>
          <Sparkles className="h-4 w-4" />
          Generate Latest Summary
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="py-8 text-center">
            <Brain className="mx-auto mb-3 h-8 w-8 text-on-surface-variant" />
            <p className="text-sm text-on-surface-variant">
              AI analysis will be available after incidents are created.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
