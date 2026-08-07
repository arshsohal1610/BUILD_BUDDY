const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export const getUserEventsUrl = (userId: number) => `${API_BASE_URL.replace(/^http/, "ws")}/ws/users/${userId}`;

export type Project = {
  id: number;
  title: string;
  description: string;
  skills_required: string;
  team_size: number;
  created_by?: string | null;
  member_count?: number;
};

export type ProjectInput = {
  title: string;
  description: string;
  skills_required: string;
  team_size: number;
  created_by?: string | null;
};

export type BuildBuddyUser = {
  id: number;
  username: string;
  email: string;
  bio?: string | null;
  college?: string | null;
  branch?: string | null;
  year?: string | null;
  location?: string | null;
  skills?: string | null;
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  profile_image?: string | null;
};

export type ProfileUpdate = Partial<Omit<BuildBuddyUser, "id" | "email">>;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function signupUser(user: { username: string; email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Signup failed");
  }

  return response.json();
}

export async function loginUser(user: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || "Login failed");
  }

  return response.json() as Promise<{
    message: string;
    user: BuildBuddyUser;
  }>;
}

export async function getProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`);

  if (!response.ok) {
    throw new Error("Failed to load projects");
  }

  return response.json() as Promise<Project[]>;
}

export async function createProject(project: ProjectInput) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json() as Promise<Project>;
}

export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return response.json() as Promise<BuildBuddyUser[]>;
}

export const searchBuildBuddy = (query: string) => request<{ users: BuildBuddyUser[]; projects: Project[]; skills: string[] }>(`/search?q=${encodeURIComponent(query)}`);

export const getProfile = (email: string) => request<BuildBuddyUser>(`/me?email=${encodeURIComponent(email)}`);
export const updateProfile = (email: string, profile: ProfileUpdate) => request<BuildBuddyUser>(`/me?email=${encodeURIComponent(email)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
export const getUserProjects = (userId: number) => request<{ created_projects: Project[]; joined_projects: Project[] }>(`/users/${userId}/projects`);
export const getBuddies = (userId: number) => request<BuildBuddyUser[]>(`/buddies/${userId}`);
export const sendBuddyRequest = (requester_id: number, receiver_id: number) => request(`/buddies/request`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requester_id, receiver_id }) });
export const getBuddyRequests = (userId: number) => request<{ received: { id: number; requester_id: number; receiver_id: number; username: string }[]; sent: { id: number; requester_id: number; receiver_id: number; username: string }[] }>(`/buddies/requests/${userId}`);
export const acceptBuddyRequest = (requestId: number) => request(`/buddies/request/${requestId}/accept`, { method: "POST" });
export const rejectBuddyRequest = (requestId: number) => request(`/buddies/request/${requestId}/reject`, { method: "POST" });
export const joinProject = (projectId: number, email: string) => request(`/projects/${projectId}/join?user_email=${encodeURIComponent(email)}`, { method: "POST" });
export const leaveProject = (projectId: number, email: string) => request(`/projects/${projectId}/leave?user_email=${encodeURIComponent(email)}`, { method: "DELETE" });
export const getDirectMessages = (userId: number) => request<Message[]>(`/messages/user/${userId}`);
export const sendDirectMessage = (sender_id: number, receiver_id: number, content: string) => request<Message>(`/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sender_id, receiver_id, content }) });
export const getProjectMessages = (projectId: number, userId: number) => request<Message[]>(`/messages/project/${projectId}?user_id=${userId}`);
export const sendProjectMessage = (sender_id: number, project_id: number, content: string) => request<Message>(`/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sender_id, project_id, content }) });
export type Message = { id: number; sender_id: number; receiver_id?: number | null; project_id?: number | null; content: string; sent_at: string };
