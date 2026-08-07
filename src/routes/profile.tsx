import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trophy, Award, Star, Github, Linkedin, Globe } from "lucide-react";
import { useUser } from "@/lib/auth";
import { toast } from "sonner";
import { getBuddies, getProfile, getUserProjects, updateProfile, type BuildBuddyUser, type Project } from "@/lib/api";
import { setUser } from "@/lib/auth";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · BuildBuddy" }] }),
  component: Profile,
});

const skills: string[] = [];

const achievements: { icon: typeof Trophy; label: string; year: string; tint: string }[] = [];

const completed: { name: string; role: string; year: string }[] = [];

function Profile() {
  const user = useUser();
  const [profile, setProfile] = useState<BuildBuddyUser | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileUpdateForm>({});
  useEffect(() => { if (user?.email) getProfile(user.email).then(setProfile).catch(() => undefined); }, [user?.email]);
  useEffect(() => { if (user?.id) Promise.all([getBuddies(user.id), getUserProjects(user.id)]).then(([buddies, projects]) => { setConnectionCount(buddies.length); setCreatedProjects(projects.created_projects); setJoinedProjects(projects.joined_projects); }).catch(() => undefined); }, [user?.id]);
  const current = profile ?? user;
  const name = current?.username ?? "";
  const email = current?.email ?? "";
  const profileSkills = current?.skills?.split(",").map((skill) => skill.trim()).filter(Boolean) ?? skills;
  const openEdit = () => { setForm({ username: current?.username ?? "", bio: current?.bio ?? "", college: current?.college ?? "", branch: current?.branch ?? "", year: current?.year ?? "", location: current?.location ?? "", skills: current?.skills ?? "", github: current?.github ?? "", linkedin: current?.linkedin ?? "", portfolio: current?.portfolio ?? "", profile_image: current?.profile_image ?? "" }); setEditing(true); };
  const saveProfile = async (event: React.FormEvent) => { event.preventDefault(); if (!user?.email) return; try { setSaving(true); const saved = await updateProfile(user.email, form); setProfile(saved); setUser(saved); setEditing(false); toast.success("Profile updated", { description: "Your changes have been saved." }); } catch (error) { toast.error("Profile update failed", { description: error instanceof Error ? error.message : undefined }); } finally { setSaving(false); } };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8 lg:py-12">
        {/* Profile header */}
        <div className="surface-card overflow-hidden">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30" />
          <div className="px-6 sm:px-8 pb-6 -mt-12">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-4">
              <div className="grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-3xl bg-primary text-primary-foreground font-display text-3xl font-bold shadow-card border-4 border-background shrink-0">
                {current?.profile_image ? <img src={current.profile_image} alt="Profile" className="h-full w-full rounded-3xl object-cover" /> : name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 pb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold truncate">{name}</h1>
                <p className="text-sm text-muted-foreground truncate">{[current?.branch, current?.college, current?.year, current?.location].filter(Boolean).join(" · ")}</p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 rounded-full"
                onClick={openEdit}
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
              {current?.bio || ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <a className="inline-flex items-center gap-1.5 hover:text-foreground"><Globe className="h-4 w-4" /> {email}</a>
              {current?.github && <a className="inline-flex items-center gap-1.5 hover:text-foreground" href={current.github}><Github className="h-4 w-4" /> {current.github}</a>}
              {current?.linkedin && <a className="inline-flex items-center gap-1.5 hover:text-foreground" href={current.linkedin}><Linkedin className="h-4 w-4" /> {current.linkedin}</a>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Projects completed", value: createdProjects.length + joinedProjects.length },
            { label: "Connections", value: connectionCount },
            { label: "Skills", value: profileSkills.length },
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
            {profileSkills.map((s) => (
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
            {[...createdProjects.map((project) => ({ project, role: "Created" })), ...joinedProjects.map((project) => ({ project, role: "Joined" }))].map(({ project, role }) => (
              <div key={project.id} className="surface-card p-5">
                <div className="h-20 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-3" />
                <h3 className="font-semibold truncate">{project.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{role}</p>
              </div>
            ))}
          </div>
        </Section>
        <ProfileDialog open={editing} onOpenChange={setEditing} form={form} setForm={setForm} saving={saving} onSubmit={saveProfile} />
      </div>
    </AppShell>
  );
}

type ProfileUpdateForm = { username?: string; bio?: string; college?: string; branch?: string; year?: string; location?: string; skills?: string; github?: string; linkedin?: string; portfolio?: string; profile_image?: string };

function ProfileDialog({ open, onOpenChange, form, setForm, saving, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; form: ProfileUpdateForm; setForm: React.Dispatch<React.SetStateAction<ProfileUpdateForm>>; saving: boolean; onSubmit: (event: React.FormEvent) => void }) {
  const input = (key: keyof ProfileUpdateForm, label: string, textarea = false) => <div key={key}><Label htmlFor={`profile-${key}`}>{label}</Label>{textarea ? <Textarea id={`profile-${key}`} value={form[key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5" /> : <Input id={`profile-${key}`} value={form[key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5" />}</div>;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader><form onSubmit={onSubmit} className="space-y-4">{input("username", "Username")}{input("bio", "Bio", true)}<div className="grid sm:grid-cols-2 gap-4">{input("college", "College")}{input("branch", "Branch")}{input("year", "Academic year")}{input("location", "Location")}</div>{input("skills", "Skills (comma separated)")}{input("github", "GitHub URL")}{input("linkedin", "LinkedIn URL")}{input("portfolio", "Portfolio URL")}{input("profile_image", "Profile picture URL")}<Button type="submit" className="w-full" disabled={saving}>{saving ? "Updating..." : "Update Profile"}</Button></form></DialogContent></Dialog>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
