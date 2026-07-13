"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, Image, Paperclip, AtSign, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateUpdate } from "@/hooks/use-incidents";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const STORAGE_KEY = "incidentiq-username";

function getStoredName(): string {
  if (typeof window === "undefined") return "You";
  return localStorage.getItem(STORAGE_KEY) || "You";
}

function setStoredName(name: string) {
  localStorage.setItem(STORAGE_KEY, name);
}

interface UpdateComposerProps {
  incidentId: string;
}

export function UpdateComposer({ incidentId }: UpdateComposerProps) {
  const [message, setMessage] = useState("");
  const [authorName, setAuthorName] = useState(getStoredName);
  const [showNamePrompt, setShowNamePrompt] = useState(authorName === "You");
  const [nameInput, setNameInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionUsers, setMentionUsers] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createUpdate = useCreateUpdate(incidentId);
  const toast = useToast();

  useEffect(() => {
    supabase
      .from("incidents")
      .select("reporter_name")
      .then((result: { data: { reporter_name: string }[] | null }) => {
        const names = new Set<string>();
        result.data?.forEach((i) => { if (i.reporter_name) names.add(i.reporter_name); });
        supabase
          .from("incident_updates")
          .select("author_name")
          .then((updatesResult: { data: { author_name: string }[] | null }) => {
            updatesResult.data?.forEach((u) => { if (u.author_name) names.add(u.author_name); });
            setMentionUsers(Array.from(names).sort());
          });
      });
  }, []);

  const handleSubmit = () => {
    if (!message.trim()) return;
    createUpdate.mutate(
      { message: message.trim(), author_name: authorName },
      {
        onSuccess: () => setMessage(""),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to post update"),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const insertAtCursor = (before: string, after = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    setMessage(text.slice(0, start) + before + text.slice(start, end) + after + text.slice(end));
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + before.length;
    }, 0);
  };

  const handleSaveName = () => {
    const name = nameInput.trim() || "You";
    setStoredName(name);
    setAuthorName(name);
    setShowNamePrompt(false);
  };

  const filteredMentions = mentionUsers.filter((u) =>
    u.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  return (
    <div className="rounded-lg border border-border bg-surface-container-low">
      <div className="flex items-center gap-1 border-b border-border px-3 py-1.5">
        <button onClick={() => insertAtCursor("```\n", "\n```")} className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" title="Insert code block">
          <Terminal className="h-4 w-4" />
        </button>
        <button onClick={() => { const url = prompt("Paste image URL:"); if (url) insertAtCursor(`![image](${url})`); }} className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" title="Insert image">
          <Image className="h-4 w-4" />
        </button>
        <button onClick={() => { const name = prompt("File name:"); if (name) insertAtCursor(`[${name}](url)`); }} className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" title="Attach file">
          <Paperclip className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" />
        <div className="relative">
          <button onClick={() => setShowMentions(!showMentions)} className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" title="Mention user">
            <AtSign className="h-4 w-4" />
          </button>
          {showMentions && (
            <div className="absolute bottom-full left-0 mb-1 w-44 rounded-lg border border-border bg-surface shadow-xl z-50">
              <input
                value={mentionSearch}
                onChange={(e) => setMentionSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full border-b border-border bg-transparent px-2 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
              />
              <div className="max-h-32 overflow-y-auto">
                {filteredMentions.length > 0 ? filteredMentions.map((name) => (
                  <button
                    key={name}
                    onClick={() => { insertAtCursor(`@${name} `); setShowMentions(false); setMentionSearch(""); }}
                    className="block w-full text-left px-2 py-1.5 text-xs text-on-surface hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {name}
                  </button>
                )) : (
                  <p className="px-2 py-2 text-xs text-on-surface-variant">No users found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Post an update..."
        className="w-full resize-none bg-transparent px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none min-h-[60px]"
        rows={2}
      />

      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <div className="flex items-center gap-2">
          {showNamePrompt ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-on-surface-variant">Name:</span>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }}
                className="w-24 rounded border border-border bg-[#050505] px-1.5 py-0.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="Your name"
                autoFocus
              />
            </div>
          ) : (
            <button onClick={() => { setShowNamePrompt(true); setNameInput(authorName); }} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-on-surface-variant hover:bg-white/5 transition-colors cursor-pointer">
              <AtSign className="h-3.5 w-3.5" />
              {authorName}
            </button>
          )}
        </div>
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
