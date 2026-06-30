const API_BASE_URL = "http://127.0.0.1:8000";

export async function getWelcomeMessage() {
  const response = await fetch(`${API_BASE_URL}/`);

  if (!response.ok) {
    throw new Error("Backend not reachable");
  }
  return response.json();
}
