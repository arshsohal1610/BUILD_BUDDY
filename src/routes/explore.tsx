import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { buddies, type Buddy } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore Buddies · BuildBuddy" }] }),
  component: Explore,
});

const filters = ["All", "AI/ML", "Web Development", "App Development", "Designers", "Beginners", "Experts"] as const;

function Explore() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const list = useMemo(() => {
    return buddies.filter((b) => {
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
  }, [q, filter]);

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
          {list.map((b) => <BuddyCard key={b.id} buddy={b} />)}
          {list.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">No buddies match that search yet.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function BuddyCard({ buddy }: { buddy: Buddy }) {
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
        onClick={() => toast.success("✅ Connection request sent", { description: `You connected with ${buddy.name}` })}
      >
        <UserPlus className="h-4 w-4" /> Connect
      </Button>
    </div>
  );
}
