import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { acceptBuddyRequest, getBuddies, getBuddyRequests, getUsers, rejectBuddyRequest, searchBuildBuddy, sendBuddyRequest, type BuildBuddyUser } from "@/lib/api";
import { useUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore Buddies · BuildBuddy" }] }),
  component: Explore,
});

const filters = ["All", "AI/ML", "Web Development", "App Development", "Designers", "Beginners", "Experts"] as const;

type Buddy = {
  id: string;
  name: string;
  occupation: string;
  skills: string[];
  category: string;
  level: "Beginner" | "Expert";
  initials: string;
  color: "primary" | "accent" | "success" | "warning";
};

const colors: Buddy["color"][] = ["primary", "accent", "success", "warning"];

function userToBuddy(user: BuildBuddyUser): Buddy {
  const name = user.username || user.email.split("@")[0] || "Builder";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "B";

  return {
    id: String(user.id),
    name,
    occupation: user.email,
    skills: user.skills?.split(",").map((skill) => skill.trim()).filter(Boolean) ?? [],
    category: "Web Development",
    level: "Beginner",
    initials,
    color: colors[user.id % colors.length],
  };
}

function Explore() {
  const currentUser = useUser();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [users, setUsers] = useState<BuildBuddyUser[]>([]);
  const [connectedIds, setConnectedIds] = useState<Set<number>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [receivedRequests, setReceivedRequests] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load users", { description: "Please check your backend." });
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    if (!q.trim()) { getUsers().then(setUsers).catch(() => undefined); return; }
    const timer = window.setTimeout(() => searchBuildBuddy(q).then((result) => setUsers(result.users)).catch(() => undefined), 250);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    if (!currentUser?.id) return;
    Promise.all([getBuddies(currentUser.id), getBuddyRequests(currentUser.id)]).then(([buddies, requests]) => {
      setConnectedIds(new Set(buddies.map((buddy) => buddy.id)));
      setPendingIds(new Set(requests.sent.map((request) => request.receiver_id)));
      setReceivedRequests(new Map(requests.received.map((request) => [request.requester_id, request.id])));
    }).catch(() => undefined);
  }, [currentUser?.id]);

  const list = useMemo(() => {
    return users
      .filter((user) => user.email !== currentUser?.email)
      .map(userToBuddy)
      .filter((b) => {
      if (filter !== "All") {
        if (filter === "Beginners" && b.level !== "Beginner") return false;
        if (filter === "Experts" && b.level !== "Expert") return false;
        if (!["Beginners", "Experts"].includes(filter) && b.category !== filter) return false;
      }
      if (q) {
        const hay = (b.name + b.occupation + b.skills.join(" ") + b.category).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [currentUser?.email, q, filter, users]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8 lg:py-12">
        <div>
          <p className="text-sm text-muted-foreground">Explore</p>
          <h1 className="mt-1 text-3xl lg:text-4xl font-bold">Find your next <span className="text-gradient">build buddy</span></h1>
          <p className="mt-1.5 text-muted-foreground">Search by name, skill or domain — then send a quick hello.</p>
        </div>

        <div className="mt-6 relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, skill, or domain..."
            className="pl-11 h-12 rounded-full bg-surface"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((b) => <BuddyCard key={b.id} buddy={b} state={connectedIds.has(Number(b.id)) ? "connected" : receivedRequests.has(Number(b.id)) ? "received" : pendingIds.has(Number(b.id)) ? "pending" : "connect"} onConnect={async () => {
            if (!currentUser?.id) { toast.error("Please sign in to connect"); return; }
            const requestId = receivedRequests.get(Number(b.id));
            if (requestId) {
              try {
                if (window.confirm(`Accept ${b.name}'s buddy request? Select Cancel to reject.`)) { await acceptBuddyRequest(requestId); setConnectedIds((ids) => new Set(ids).add(Number(b.id))); }
                else { await rejectBuddyRequest(requestId); }
                setReceivedRequests((requests) => { const next = new Map(requests); next.delete(Number(b.id)); return next; });
              } catch (error) { toast.error(error instanceof Error ? error.message : "Could not respond to request"); }
              return;
            }
            try { await sendBuddyRequest(currentUser.id, Number(b.id)); setPendingIds((ids) => new Set(ids).add(Number(b.id))); toast.success("Connection request sent!", { description: `You connected with ${b.name}` }); }
            catch (error) { toast.error(error instanceof Error ? error.message : "Could not send request"); }
          }} />)}
          {list.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">No buddies match that search yet.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function BuddyCard({ buddy, state, onConnect }: { buddy: Buddy; state: "connect" | "pending" | "received" | "connected"; onConnect: () => void }) {
  const tints: Record<Buddy["color"], string> = {
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
  };
  return (
    <div className="surface-card p-5 flex flex-col items-center text-center">
      <div className={`grid h-16 w-16 place-items-center rounded-2xl font-bold text-lg shadow-soft ${tints[buddy.color]}`}>
        {buddy.initials}
      </div>
      <h3 className="mt-3 font-semibold">{buddy.name}</h3>
      <p className="text-xs text-muted-foreground">{buddy.occupation}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
        {buddy.skills.map((s) => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">{s}</span>
        ))}
      </div>
      <Button
        variant="outline"
        className="mt-4 w-full rounded-full"
        onClick={onConnect}
        disabled={state === "connected" || state === "pending"}
      >
        <UserPlus className="h-4 w-4" /> {state === "connected" ? "Connected" : state === "pending" ? "Request sent" : state === "received" ? "Respond" : "Connect"}
      </Button>
    </div>
  );
}
