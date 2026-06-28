import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Phone, Video, MoreVertical } from "lucide-react";
import { chatThreads, seedMessages } from "@/lib/mock-data";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat · BuildBuddy" }] }),
  component: ChatPage,
});

type Msg = { id: number; from: "me" | "them"; text: string; time: string };

function ChatPage() {
  const [activeId, setActiveId] = useState<string>("c1");
  const [q, setQ] = useState("");
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Msg[]>>(seedMessages);
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() =>
    chatThreads.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  const active = chatThreads.find((t) => t.id === activeId)!;
  const msgs = messagesByThread[activeId] ?? [];

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setMessagesByThread((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { id: Date.now(), from: "me", text: draft, time }],
    }));
    setDraft("");
  };

  const tint = (c: string) => ({
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
  }[c] ?? "bg-muted");

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex">
        {/* Thread list */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 border-r border-border bg-surface/40 flex flex-col">
          <div className="p-4 border-b border-border">
            <h1 className="font-display text-xl font-bold mb-3">Messages</h1>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats..." className="pl-9 rounded-full" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-border/60 transition-colors ${
                  activeId === t.id ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`grid h-11 w-11 place-items-center rounded-full font-semibold ${tint(t.color)}`}>
                    {t.initials}
                  </div>
                  {t.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{t.name}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{t.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.last}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="hidden md:flex flex-1 min-w-0 flex-col">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`grid h-10 w-10 place-items-center rounded-full font-semibold ${tint(active.color)}`}>
                {active.initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{active.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {active.online && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                  {active.online ? "Online now" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
            {msgs.length === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-12">Say hi to {active.name} 👋</p>
            )}
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.from === "me"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}>
                  {m.text}
                  <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="p-4 border-t border-border flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message..."
              className="rounded-full bg-surface"
            />
            <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
