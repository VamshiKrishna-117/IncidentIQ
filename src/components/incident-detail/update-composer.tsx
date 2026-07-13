"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, Image, Paperclip, AtSign, Send, X, Upload, Link as LinkIcon, Code } from "lucide-react";
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

type ToolPanel = "code" | "image" | "file" | null;
type ImageTab = "url" | "upload";

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
  const [activePanel, setActivePanel] = useState<ToolPanel>(null);
  const [imageTab, setImageTab] = useState<ImageTab>("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [filePreview, setFilePreview] = useState<{ name: string; size: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      { onSuccess: () => setMessage(""), onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to post update") }
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

  const insertCode = () => {
    if (codeContent.trim()) {
      insertAtCursor("```\n" + codeContent + "\n```");
      setCodeContent("");
      setActivePanel(null);
    }
  };

  const insertImageUrl = () => {
    if (imageUrl.trim()) {
      insertAtCursor(`![image](${imageUrl.trim()})`);
      setImageUrl("");
      setImagePreview("");
      setActivePanel(null);
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const [fileInputKey, setFileInputKey] = useState(0);

  const insertImageUpload = () => {
    if (imagePreview) {
      insertAtCursor(`![${imageFileName}](${imagePreview})`);
      setImagePreview("");
      setImageFileName("");
      setImageUrl("");
      setActivePanel(null);
      setFileInputKey((k) => k + 1);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const size = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;
    setFilePreview({ name: file.name, size });
  };

  const insertFile = () => {
    if (filePreview) {
      insertAtCursor(`[${filePreview.name}](url)`);
      setFilePreview(null);
      setActivePanel(null);
      setFileInputKey((k) => k + 1);
    }
  };

  const closePanel = () => {
    setActivePanel(null);
    setCodeContent("");
    setImageUrl("");
    setImagePreview("");
    setImageFileName("");
    setFilePreview(null);
    setFileInputKey((k) => k + 1);
  };

  const filteredMentions = mentionUsers.filter((u) =>
    u.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  return (
    <div className="rounded-lg border border-border bg-surface-container-low">
      <div className="flex items-center gap-1 border-b border-border px-3 py-1.5">
        <button onClick={() => setActivePanel(activePanel === "code" ? null : "code")} className={`rounded p-1 transition-colors cursor-pointer ${activePanel === "code" ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"}`} title="Insert code block">
          <Terminal className="h-4 w-4" />
        </button>
        <button onClick={() => { setActivePanel(activePanel === "image" ? null : "image"); setImageTab("url"); }} className={`rounded p-1 transition-colors cursor-pointer ${activePanel === "image" ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"}`} title="Insert image">
          <Image className="h-4 w-4" />
        </button>
        <button onClick={() => { setActivePanel(activePanel === "file" ? null : "file"); }} className={`rounded p-1 transition-colors cursor-pointer ${activePanel === "file" ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"}`} title="Attach file">
          <Paperclip className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" />
        <div className="relative">
          <button onClick={() => setShowMentions(!showMentions)} className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors cursor-pointer" title="Mention user">
            <AtSign className="h-4 w-4" />
          </button>
          {showMentions && (
            <div className="absolute bottom-full left-0 mb-1 w-44 rounded-lg border border-border bg-surface shadow-xl z-50">
              <input value={mentionSearch} onChange={(e) => setMentionSearch(e.target.value)} placeholder="Search users..." className="w-full border-b border-border bg-transparent px-2 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none" />
              <div className="max-h-32 overflow-y-auto">
                {filteredMentions.length > 0 ? filteredMentions.map((name) => (
                  <button key={name} onClick={() => { insertAtCursor(`@${name} `); setShowMentions(false); setMentionSearch(""); }} className="block w-full text-left px-2 py-1.5 text-xs text-on-surface hover:bg-white/5 transition-colors cursor-pointer">{name}</button>
                )) : (
                  <p className="px-2 py-2 text-xs text-on-surface-variant">No users found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {activePanel === "code" && (
        <div className="border-b border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
              <Code className="h-3.5 w-3.5" />
              Code Block
            </span>
            <button onClick={closePanel} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            placeholder="Paste or type your code here..."
            className="w-full resize-none rounded border border-border bg-[#050505] px-2.5 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary min-h-[80px]"
            rows={4}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={closePanel}>Cancel</Button>
            <Button size="sm" onClick={insertCode} disabled={!codeContent.trim()}>Insert</Button>
          </div>
        </div>
      )}

      {activePanel === "image" && (
        <div className="border-b border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setImageTab("url")} className={`rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${imageTab === "url" ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                <LinkIcon className="mr-1 inline h-3 w-3" />
                Paste URL
              </button>
              <button onClick={() => setImageTab("upload")} className={`rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${imageTab === "upload" ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                <Upload className="mr-1 inline h-3 w-3" />
                Upload
              </button>
            </div>
            <button onClick={closePanel} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          {imageTab === "url" ? (
            <div>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full rounded border border-border bg-[#050505] px-2.5 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
              />
              {imageUrl && (
                <div className="mt-2 rounded border border-border bg-[#050505] p-2">
                  <img src={imageUrl} alt="Preview" className="max-h-32 rounded object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={closePanel}>Cancel</Button>
                <Button size="sm" onClick={insertImageUrl} disabled={!imageUrl.trim()}>Insert</Button>
              </div>
            </div>
          ) : (
            <div>
              <input key={fileInputKey} ref={imageFileRef} type="file" accept="image/*" onChange={handleImageFileSelect} className="w-full text-xs text-on-surface-variant file:mr-2 file:rounded file:border-0 file:bg-primary/20 file:px-2 file:py-1 file:text-xs file:text-primary cursor-pointer" />
              {imagePreview && (
                <div className="mt-2 rounded border border-border bg-[#050505] p-2">
                  <img src={imagePreview} alt="Preview" className="max-h-32 rounded object-contain" />
                </div>
              )}
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={closePanel}>Cancel</Button>
                <Button size="sm" onClick={insertImageUpload} disabled={!imagePreview}>Insert</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activePanel === "file" && (
        <div className="border-b border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Attach File</span>
            <button onClick={closePanel} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <input key={fileInputKey} ref={fileInputRef} type="file" onChange={handleFileSelect} className="w-full text-xs text-on-surface-variant file:mr-2 file:rounded file:border-0 file:bg-primary/20 file:px-2 file:py-1 file:text-xs file:text-primary cursor-pointer" />
          {filePreview && (
            <div className="mt-2 flex items-center gap-2 rounded border border-border bg-[#050505] px-2.5 py-1.5">
              <Paperclip className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
              <span className="flex-1 text-xs text-on-surface truncate">{filePreview.name}</span>
              <span className="text-[10px] text-on-surface-variant">{filePreview.size}</span>
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={closePanel}>Cancel</Button>
            <Button size="sm" onClick={insertFile} disabled={!filePreview}>Insert</Button>
          </div>
        </div>
      )}

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
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} onBlur={handleSaveName} onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }} className="w-24 rounded border border-border bg-[#050505] px-1.5 py-0.5 text-xs text-on-surface focus:outline-none focus:border-primary" placeholder="Your name" autoFocus />
            </div>
          ) : (
            <button onClick={() => { setShowNamePrompt(true); setNameInput(authorName); }} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-on-surface-variant hover:bg-white/5 transition-colors cursor-pointer">
              <AtSign className="h-3.5 w-3.5" />
              {authorName}
            </button>
          )}
        </div>
        <Button size="sm" onClick={handleSubmit} loading={createUpdate.isPending} disabled={!message.trim()}>
          <Send className="h-4 w-4" />
          Post
        </Button>
      </div>
    </div>
  );
}
