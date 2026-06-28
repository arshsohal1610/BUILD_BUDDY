import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Pencil, Trophy, Award, Star, Github, Linkedin, Globe } from "lucide-react";
import { useUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · BuildBuddy" }] }),
  component: Profile,
});

const skills = ["React", "TypeScript", "Python", "TensorFlow", "Figma", "Node.js", "PostgreSQL", "Tailwind"];

const achievements = [
  { icon: Trophy, label: "Smart India Hackathon · Winner", year: "2024", tint: "bg-warning/10 text-warning" },
  { icon: Award, label: "AWS Certified Developer", year: "2024", tint: "bg-primary/10 text-primary" },
  { icon: Star, label: "Top 5% open-source contributor", year: "2023", tint: "bg-accent/10 text-accent" },
];

const completed = [
  { name: "BuildBuddy Beta", role: "Full-stack lead", year: "2025" },
  { name: "Resume Roast AI", role: "ML engineer", year: "2024" },
  { name: "Campus Swap", role: "Mobile dev", year: "2024" },
];

function Profile() {
  const user = useUser();
  const name = user?.username ?? "Builder";
  const email = user?.email ?? "builder@buildbuddy.dev";

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8 lg:py-12">
        {/* Profile header */}
        <div className="surface-card overflow-hidden">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30" />
          <div className="px-6 sm:px-8 pb-6 -mt-12">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-4">
              <div className="grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-3xl bg-primary text-primary-foreground font-display text-3xl font-bold shadow-card border-4 border-background shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 pb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold truncate">{name}</h1>
                <p className="text-sm text-muted-foreground truncate">Full-stack builder · AI/ML enthusiast</p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 rounded-full"
                onClick={() => toast.success("✅ Profile updated", { description: "Your changes have been saved." })}
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
              Building delightful products at the intersection of AI and developer tooling. Currently shipping BuildBuddy.
              Looking for partners on weekend hackathons and longer-term open-source ventures.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <a className="inline-flex items-center gap-1.5 hover:text-foreground"><Globe className="h-4 w-4" /> {email}</a>
              <a className="inline-flex items-center gap-1.5 hover:text-foreground"><Github className="h-4 w-4" /> github.com/{name.toLowerCase()}</a>
              <a className="inline-flex items-center gap-1.5 hover:text-foreground"><Linkedin className="h-4 w-4" /> linkedin.com/in/{name.toLowerCase()}</a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Projects completed", value: 14 },
            { label: "Connections", value: 132 },
            { label: "Skills", value: skills.length },
          ].map((s) => (
            <div key={s.label} className="surface-card p-5 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{s.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        </Section>

        {/* Achievements */}
        <Section title="Achievements">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.label} className="surface-card p-4 flex items-start gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${a.tint} shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight">{a.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.year}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Completed projects */}
        <Section title="Completed projects">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completed.map((p) => (
              <div key={p.name} className="surface-card p-5">
                <div className="h-20 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-3" />
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{p.role} · {p.year}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
