"use client";

import { useState } from "react";
import { Terminal, Image, Paperclip, AtSign, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateUpdate } from "@/hooks/use-incidents";
import { useToast } from "@/hooks/use-toast";

interface UpdateComposerProps {
  incidentId: string;
}

export function UpdateComposer({ incidentId }: UpdateComposerProps) {
  const [message, setMessage] = useState("");
  const createUpdate = useCreateUpdate(incidentId);
  const toast = useToast();

  const handleSubmit = () => {
    if (!message.trim()) return;
    createUpdate.mutate(
      { message: message.trim(), author_name: "You" },
      {
        onSuccess: () => {
          setMessage("");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to post update");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface-container-low">
      <div className="flex items-center gap-1 border-b border-border px-3 py-1.5">
        <button className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors">
          <Terminal className="h-4 w-4" />
        </button>
        <button className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors">
          <Image className="h-4 w-4" />
        </button>
        <button className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors">
          <Paperclip className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors">
          <AtSign className="h-4 w-4" />
        </button>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Post an update..."
        className="w-full resize-none bg-transparent px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none min-h-[60px]"
        rows={2}
      />

      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <button className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-on-surface-variant hover:bg-white/5 transition-colors">
          <AtSign className="h-3.5 w-3.5" />
          Notify Channel
        </button>
        <Button
          size="sm"
          onClick={handleSubmit}
          loading={createUpdate.isPending}
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4" />
          Post
        </Button>
      </div>
    </div>
  );
}
