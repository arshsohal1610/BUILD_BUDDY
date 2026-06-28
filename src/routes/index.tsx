import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import {
  Hammer, Moon, Sun, Users, Sparkles, MessageSquare,
  Layers, Briefcase, ArrowRight, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuildBuddy — Find your perfect project partner" },
      { name: "description", content: "Connect with students, developers, designers and innovators to build amazing projects together." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Users, title: "Find Project Partners", desc: "Discover builders who share your vision and complement your skills." },
  { icon: Sparkles, title: "Skill Matching", desc: "Smart suggestions pair you with people whose strengths fill your gaps." },
  { icon: MessageSquare, title: "Real-time Chat", desc: "Brainstorm, plan and ship — all without leaving the app." },
  { icon: Layers, title: "Team Collaboration", desc: "Manage projects, milestones and roles in one shared workspace." },
  { icon: Briefcase, title: "Portfolio Building", desc: "Every shipped project becomes a public showcase of your work." },
];

function Landing() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Hammer className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">BuildBuddy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#home" className="hover:text-foreground transition">Home</a>
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#about" className="hover:text-foreground transition">About</a>
            <a href="#contact" className="hover:text-foreground transition">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-24 lg:pt-28 lg:pb-36 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground border border-border">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Now matching 12,000+ builders
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              Find your perfect <span className="text-gradient">project partner</span>.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Connect with students, developers, designers and innovators to build amazing
              projects together — from weekend hacks to year-long ventures.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/auth">Get Started <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Free to join", "No credit card", "Verified profiles"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>

          <FloatingHero />
        </div>
      </section>

      <section id="features" className="py-20 lg:py-28 bg-surface/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Features</p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold">Everything you need to ship together.</h2>
            <p className="mt-3 text-muted-foreground">A focused toolkit for builders who'd rather create than configure.</p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="surface-card p-6 hover:translate-y-[-2px] transition-transform"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold">Built for the next generation of builders.</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            BuildBuddy started as a side project to help college teams find each other.
            Today it's home to thousands of students, developers, designers and AI/ML
            enthusiasts who'd rather ship than search.
          </p>
        </div>
      </section>

      <section id="contact" className="pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="surface-card p-8 lg:p-12 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
            <h2 className="relative text-3xl font-bold">Ready to build something amazing?</h2>
            <p className="relative mt-3 text-muted-foreground">Join the community and find your next collaborator today.</p>
            <Button asChild size="lg" className="relative mt-6 rounded-full px-6">
              <Link to="/auth">Create your account <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BuildBuddy. Crafted for builders.</p>
          <p>Made with care.</p>
        </div>
      </footer>
    </div>
  );
}

function FloatingHero() {
  return (
    <div className="relative h-[420px] lg:h-[520px]">
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-72 w-72 lg:h-96 lg:w-96 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 blur-3xl" />
      </div>

      <FloatCard className="top-4 left-4 animate-float" delay="0s">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-semibold">SA</div>
          <div>
            <p className="font-semibold text-sm">Sanjivni A.</p>
            <p className="text-xs text-muted-foreground">AI/ML · Python</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {["TensorFlow", "NLP"].map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s}</span>
          ))}
        </div>
      </FloatCard>

      <FloatCard className="top-1/2 right-2 -translate-y-1/2 animate-float-rev">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground font-semibold">RK</div>
          <div>
            <p className="font-semibold text-sm">Rohan K.</p>
            <p className="text-xs text-muted-foreground">Designer · UI/UX</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {["Figma", "Motion"].map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{s}</span>
          ))}
        </div>
      </FloatCard>

      <FloatCard className="bottom-6 left-1/4 animate-float">
        <p className="text-xs font-semibold text-muted-foreground">Project match</p>
        <p className="mt-1 font-display font-bold">Climate Insights Dashboard</p>
        <div className="mt-3 flex -space-x-2">
          {["#7", "#3", "#9"].map((n, i) => (
            <div key={i} className="grid h-7 w-7 place-items-center rounded-full bg-muted border-2 border-card text-[10px] font-semibold">
              {n}
            </div>
          ))}
          <div className="ml-3 text-xs text-muted-foreground self-center">3 of 5 builders</div>
        </div>
      </FloatCard>
    </div>
  );
}

function FloatCard({
  children, className = "", delay,
}: { children: React.ReactNode; className?: string; delay?: string }) {
  return (
    <div
      className={`absolute surface-card p-4 w-56 ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}
