import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getWelcomeMessage } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Trophy, Layers, ArrowRight } from "lucide-react";
import { useUser } from "@/lib/auth";
import { recommendedProjects, activeProjects } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · BuildBuddy" }] }),
  component: Dashboard,
});

function Dashboard() {
  const user = useUser();
  const name = user?.username ?? "Builder";

  const [message, setMessage] = useState("Click the button to test the backend");
  const [loading, setLoading] = useState(false);

  async function handleBackendTest() {
    try {
      setLoading(true);

      const data = await getWelcomeMessage();

      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8 lg:py-12">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <h1 className="mt-1 text-3xl lg:text-4xl font-bold truncate">
            Welcome back, <span className="text-gradient">{name}</span>!
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Here's what's happening in your build world today.
          </p>
        </div>

        <div className="mt-6 relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects, skills, or buddies..."
            className="pl-11.h-12 rounded-full.bg-surface"
          />
        </div>

        <Button asChild className="mt-3 w-full sm:w-auto rounded-full">
          <Link to="/explore">
            Find buddies <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <div className="mt-4">
          <Button onClick={handleBackendTest} disabled={loading}>
            {loading ? "Connecting..." : "Test Backend Connection"}
          </Button>

          <p className="mt-2">{message}</p>
        </div>

        <Stats />

        <section className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-bold">Recommended projects</h2>
            <Link to="/explore" className="text-sm font-medium text-primary hover:underline">
              Browse all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {recommendedProjects.map((p) => (
              <div key={p.id} className="surface-card p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {p.category}
                    </p>
                    <h3 className="mt-1 font-display font-bold text-lg truncate">{p.name}</h3>
                  </div>
                  <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {p.filled}/{p.teamSize}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <Button
                  className="mt-4 w-full rounded-full"
                  onClick={() =>
                    toast.success("✅ Project joined", { description: `You joined ${p.name}` })
                  }
                >
                  Join project
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">My active projects</h2>
          <div className="space-y-3">
            {activeProjects.map((p) => (
              <div key={p.id} className="surface-card p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.members} members · {p.status}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-primary">{p.progress}%</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stats() {
  const items = [
    { label: "Projects joined", value: 7, Icon: Layers, tint: "bg-primary/10 text-primary" },
    { label: "Buddies connected", value: 24, Icon: Users, tint: "bg-accent/10 text-accent" },
    { label: "Skills added", value: 12, Icon: Trophy, tint: "bg-success/10 text-success" },
  ] as const;
  return (
    <div className="mt-6 grid grid-cols-3 gap-3">
      {items.map(({ label, value, Icon, tint }) => (
        <div key={label} className="surface-card p-4 sm:p-5">
          <div className={`grid h-9 w-9 place-items-center rounded-lg ${tint}`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="mt-3 text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}
