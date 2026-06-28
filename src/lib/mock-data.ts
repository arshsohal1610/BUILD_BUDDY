// Mock data shared across app pages.

export type Project = {
  id: string;
  name: string;
  skills: string[];
  teamSize: number;
  filled: number;
  category: string;
  description: string;
};

export const recommendedProjects: Project[] = [
  { id: "p1", name: "Climate Insights Dashboard", skills: ["React", "D3", "Python"], teamSize: 5, filled: 3, category: "Web Development", description: "Interactive dashboard surfacing climate data for public schools." },
  { id: "p2", name: "Resume Roast AI", skills: ["NLP", "FastAPI", "OpenAI"], teamSize: 4, filled: 2, category: "AI/ML", description: "An AI agent that reviews resumes and suggests improvements." },
  { id: "p3", name: "Campus Swap", skills: ["React Native", "Firebase"], teamSize: 3, filled: 1, category: "App Development", description: "A marketplace for college students to swap textbooks and gear." },
  { id: "p4", name: "Open Stickers Studio", skills: ["Figma", "SVG", "UI/UX"], teamSize: 4, filled: 2, category: "Design", description: "Open-source sticker pack creator for developer communities." },
];

export const activeProjects = [
  { id: "a1", name: "BuildBuddy v2", status: "In progress", progress: 64, members: 4 },
  { id: "a2", name: "Hackathon Companion", status: "Planning", progress: 18, members: 3 },
];

export type Buddy = {
  id: string;
  name: string;
  occupation: string;
  skills: string[];
  category: string;
  level: "Beginner" | "Expert";
  initials: string;
  color: "primary" | "accent" | "success" | "warning";
};

export const buddies: Buddy[] = [
  { id: "b1", name: "Sanjivni Arora", occupation: "AI/ML Engineer", skills: ["Python", "TensorFlow", "NLP"], category: "AI/ML", level: "Expert", initials: "SA", color: "primary" },
  { id: "b2", name: "Rohan Kapoor", occupation: "Product Designer", skills: ["Figma", "Motion", "UX"], category: "Designers", level: "Expert", initials: "RK", color: "accent" },
  { id: "b3", name: "Mei Lin", occupation: "Full-stack Developer", skills: ["React", "Node", "Postgres"], category: "Web Development", level: "Expert", initials: "ML", color: "success" },
  { id: "b4", name: "Diego Alvarez", occupation: "Mobile Developer", skills: ["Swift", "Kotlin"], category: "App Development", level: "Beginner", initials: "DA", color: "warning" },
  { id: "b5", name: "Aisha Khan", occupation: "ML Researcher", skills: ["PyTorch", "CV"], category: "AI/ML", level: "Expert", initials: "AK", color: "primary" },
  { id: "b6", name: "Liam O'Connor", occupation: "Frontend Dev", skills: ["Vue", "Tailwind"], category: "Web Development", level: "Beginner", initials: "LO", color: "accent" },
];

export const chatThreads = [
  { id: "c1", name: "Sanjivni Arora", last: "Sent you the dataset 🚀", time: "2m", online: true, initials: "SA", color: "primary" },
  { id: "c2", name: "Climate Dashboard Team", last: "Mei: PR is ready for review", time: "14m", online: true, initials: "CD", color: "success", group: true },
  { id: "c3", name: "Rohan Kapoor", last: "New mockups uploaded", time: "1h", online: false, initials: "RK", color: "accent" },
  { id: "c4", name: "Diego Alvarez", last: "Let's sync tomorrow?", time: "3h", online: false, initials: "DA", color: "warning" },
] as const;

export const seedMessages = {
  c1: [
    { id: 1, from: "them", text: "Hey! I just pushed the cleaned dataset.", time: "10:14" },
    { id: 2, from: "me", text: "Amazing, downloading now.", time: "10:15" },
    { id: 3, from: "them", text: "Sent you the dataset 🚀", time: "10:16" },
  ],
} as Record<string, { id: number; from: "me" | "them"; text: string; time: string }[]>;
