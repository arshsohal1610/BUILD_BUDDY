import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Hammer, Moon, Sun, ArrowLeft } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { setUser } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In · BuildBuddy" },
      { name: "description", content: "Sign in or create your BuildBuddy account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <div className="flex-1 grid lg:grid-cols-2">
        {/* Left brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/15 via-background to-accent/10 relative overflow-hidden">
          <div className="absolute top-20 -left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
          <Link to="/" className="relative flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Hammer className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold">BuildBuddy</span>
          </Link>
          <div className="relative">
            <h2 className="font-display text-4xl font-bold leading-tight">
              Where great <span className="text-gradient">projects</span> find their people.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              Join thousands of builders shipping side projects, hackathons and startups together.
            </p>
          </div>
          <div className="relative text-xs text-muted-foreground">© BuildBuddy</div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 flex justify-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Hammer className="h-4 w-4" /></div>
                <span className="font-display text-lg font-bold">BuildBuddy</span>
              </Link>
            </div>

            <h1 className="text-3xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              {mode === "signin" ? "Sign in to keep building." : "Start finding partners in under a minute."}
            </p>

            <div className="mt-6 surface-card p-6">
              {mode === "signin" ? <SignInForm /> : <SignUpForm onDone={() => setMode("signin")} />}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to BuildBuddy? " : "Already have an account? "}
              <button
                className="font-semibold text-primary hover:underline"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("sanjivni@buildbuddy.dev");
  const [password, setPassword] = useState("demo1234");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Missing details", { description: "Please fill in all fields." });
      return;
    }
    const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "") || "Builder";
    const pretty = username.charAt(0).toUpperCase() + username.slice(1);
    setUser({ username: pretty, email });
    toast.success(`✅ Welcome back, ${pretty}!`, {
      description: "Ready to build something amazing today?",
    });
    navigate({ to: "/dashboard" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
      </div>
      <Button type="submit" className="w-full">Sign In</Button>
    </form>
  );
}

function SignUpForm({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Missing details", { description: "Please complete the form." });
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match", { description: "Please re-enter your password." });
      return;
    }
    setUser({ username, email });
    toast.success(`✅ Account created`, { description: `Welcome aboard, ${username}!` });
    navigate({ to: "/dashboard" });
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="u">Username</Label>
        <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="builder42" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="e">Email</Label>
        <Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="p">Password</Label>
          <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="c">Confirm</Label>
          <Input id="c" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5" />
        </div>
      </div>
      <Button type="submit" className="w-full">Create account</Button>
    </form>
  );
}
