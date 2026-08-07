import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Phone, Video, MoreVertical } from "lucide-react";
import { getBuddies, getDirectMessages, getProjectMessages, getUserEventsUrl, getUserProjects, sendDirectMessage, sendProjectMessage } from "@/lib/api";
import { useUser } from "@/lib/auth";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat · BuildBuddy" }] }),
  component: ChatPage,
});

type Msg = { id: number; from: "me" | "them"; text: string; time: string };
type Thread = { id: string; name: string; initials: string; color: string; online: boolean; time: string; last: string; projectId?: number };

function ChatPage() {
  const user = useUser();
  const [activeId, setActiveId] = useState<string>("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [q, setQ] = useState("");
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Msg[]>>({});
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getBuddies(user.id), getUserProjects(user.id)]).then(([buddies, projectData]) => {
      const colors = ["primary", "accent", "success", "warning"];
      const directThreads = buddies.map((buddy, index) => ({ id: `user-${buddy.id}`, name: buddy.username, initials: buddy.username.slice(0, 2).toUpperCase(), color: colors[index % colors.length], online: false, time: "", last: "" }));
      const projectThreads = [...projectData.created_projects, ...projectData.joined_projects].map((project, index) => ({ id: `project-${project.id}`, name: project.title, initials: project.title.slice(0, 2).toUpperCase(), color: colors[(index + directThreads.length) % colors.length], online: false, time: "", last: "", projectId: project.id }));
      const next = [...directThreads, ...projectThreads];
      setThreads(next); setActiveId(next[0]?.id ?? "");
    }).catch(() => undefined);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !activeId) return;
    const thread = threads.find((item) => item.id === activeId);
    const load = () => {
      const source = thread?.projectId ? getProjectMessages(thread.projectId, user.id) : getDirectMessages(user.id);
      source.then((messages) => setMessagesByThread((previous) => ({ ...previous, [activeId]: messages.filter((message) => thread?.projectId ? message.project_id === thread.projectId : String(message.sender_id === user.id ? message.receiver_id : message.sender_id) === activeId.replace("user-", "") && !message.project_id).map((message) => ({ id: message.id, from: message.sender_id === user.id ? "me" : "them", text: message.content, time: new Date(message.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })) }))).catch(() => undefined);
    };
    load(); const timer = window.setInterval(load, 5000); return () => window.clearInterval(timer);
  }, [user?.id, activeId, threads]);

  useEffect(() => {
    if (!user?.id) return;
    const socket = new WebSocket(getUserEventsUrl(user.id));
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type !== "message") return;
      const message = payload.message as { id: number; sender_id: number; project_id?: number | null; content: string; sent_at: string };
      const thread = threads.find((item) => message.project_id ? item.projectId === message.project_id : item.id === `user-${message.sender_id}`);
      if (!thread) return;
      setMessagesByThread((previous) => ({ ...previous, [thread.id]: [...(previous[thread.id] ?? []), { id: message.id, from: "them", text: message.content, time: new Date(message.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }] }));
    };
    return () => socket.close();
  }, [user?.id, threads]);

  const filtered = useMemo(() =>
    threads.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())),
    [q, threads]
  );
  const active = threads.find((t) => t.id === activeId) ?? { id: "", name: "", initials: "", color: "primary", online: false, time: "", last: "" };
  const msgs = messagesByThread[activeId] ?? [];

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    if (!user?.id || !activeId) return;
    const thread = threads.find((item) => item.id === activeId);
    try { const message = thread?.projectId ? await sendProjectMessage(user.id, thread.projectId, draft) : await sendDirectMessage(user.id, Number(activeId.replace("user-", "")), draft); setMessagesByThread((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), { id: message.id, from: "me", text: message.content, time }] })); setDraft(""); } catch { /* leave draft available to retry */ }
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
