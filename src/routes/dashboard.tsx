import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createProject, getProjects, getBuddies, getUserProjects, joinProject, type Project } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Users, Trophy, Layers, ArrowRight } from "lucide-react";
import { useUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · BuildBuddy" }] }),
  component: Dashboard,
});

function Dashboard() {
  const user = useUser();
  const name = user?.username ?? "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [buddyCount, setBuddyCount] = useState(0);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectSkills, setProjectSkills] = useState("");
  const [projectTeamSize, setProjectTeamSize] = useState("3");

  useEffect(() => {
    async function loadProjects() {
      try {
        setProjectsLoading(true);
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load projects", { description: "Please check your backend." });
      } finally {
        setProjectsLoading(false);
      }
    }

    loadProjects();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getBuddies(user.id), getUserProjects(user.id)]).then(([buddies, projectData]) => {
      setBuddyCount(buddies.length); setJoinedProjects(projectData.joined_projects);
    }).catch(() => undefined);
  }, [user?.id]);

  const myProjects = projects.filter((project) => project.created_by === user?.email);
  const skillsAdded = user?.skills?.split(",").filter(Boolean).length ?? 0;

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();

    if (!projectTitle || !projectDescription || !projectSkills || !projectTeamSize) {
      toast.error("Missing details", { description: "Please complete the project form." });
      return;
    }

    const teamSize = Number(projectTeamSize);

    if (!Number.isInteger(teamSize) || teamSize < 1) {
      toast.error("Invalid team size", { description: "Team size must be at least 1." });
      return;
    }

    try {
      setCreatingProject(true);
      const project = await createProject({
        title: projectTitle,
        description: projectDescription,
        skills_required: projectSkills,
        team_size: teamSize,
        created_by: user?.email ?? null,
      });

      setProjects((current) => [project, ...current]);
      setProjectTitle("");
      setProjectDescription("");
      setProjectSkills("");
      setProjectTeamSize("3");
      toast.success("Project created", { description: `${project.title} is now listed.` });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project", { description: "Please try again." });
    } finally {
      setCreatingProject(false);
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
            className="pl-11 h-12 rounded-full bg-surface"
          />
        </div>

        <Button asChild className="mt-3 w-full sm:w-auto rounded-full">
          <Link to="/explore">
            Find buddies <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <Stats projectsCount={myProjects.length} buddyCount={buddyCount} skillsCount={skillsAdded} />

        <section className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-bold">Create project</h2>
            <Link to="/explore" className="text-sm font-medium text-primary hover:underline">
              Browse all
            </Link>
          </div>

          <form onSubmit={handleCreateProject} className="surface-card p-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-title">Title</Label>
                <Input
                  id="project-title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="AI study planner"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="project-team-size">Team size</Label>
                <Input
                  id="project-team-size"
                  type="number"
                  min="1"
                  value={projectTeamSize}
                  onChange={(e) => setProjectTeamSize(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="What are you building?"
                className="mt-1.5"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="project-skills">Skills required</Label>
              <Input
                id="project-skills"
                value={projectSkills}
                onChange={(e) => setProjectSkills(e.target.value)}
                placeholder="React, FastAPI, Design"
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="mt-4 w-full sm:w-auto rounded-full" disabled={creatingProject}>
              {creatingProject ? "Creating..." : "Create project"}
            </Button>
          </form>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-bold">Projects</h2>
            {projectsLoading ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : null}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {projects.map((p) => {
              const skills = p.skills_required
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);

              return (
                <div key={p.id} className="surface-card p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {p.created_by ? `By ${p.created_by}` : "Open project"}
                      </p>
                      <h3 className="mt-1 font-display font-bold text-lg truncate">{p.title}</h3>
                    </div>
                    <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {p.member_count ?? 0}/{p.team_size}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skills.map((s) => (
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
                    onClick={async () => { if (!user?.email) return; try { await joinProject(p.id, user.email); setProjects((items) => items.map((item) => item.id === p.id ? { ...item, member_count: (item.member_count ?? 0) + 1 } : item)); setJoinedProjects((items) => [...items, p]); toast.success("Project joined", { description: `You joined ${p.title}` }); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not join project"); } }}
                  >
                    Join project
                  </Button>
                </div>
              );
            })}
          </div>
          {!projectsLoading && projects.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No projects yet. Create the first one.</p>
          ) : null}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">My active projects</h2>
          <div className="space-y-3">
            {myProjects.map((p) => {
              const skills = p.skills_required
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);

              return (
              <div key={p.id} className="surface-card p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-primary">Active</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Team size: {p.team_size}</p>
              </div>
              );
            })}
          </div>
          {!projectsLoading && myProjects.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No active projects yet.</p>
          ) : null}
          {joinedProjects.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Joined projects: {joinedProjects.map((project) => project.title).join(", ")}</p>}
        </section>
      </div>
    </AppShell>
  );
}

function Stats({
  projectsCount,
  buddyCount,
  skillsCount,
}: {
  projectsCount: number;
  buddyCount: number;
  skillsCount: number;
}) {
  const items = [
    { label: "Projects", value: projectsCount, Icon: Layers, tint: "bg-primary/10 text-primary" },
    { label: "Buddies connected", value: buddyCount, Icon: Users, tint: "bg-accent/10 text-accent" },
    { label: "Skills added", value: skillsCount, Icon: Trophy, tint: "bg-success/10 text-success" },
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
