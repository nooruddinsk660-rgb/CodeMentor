export const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function healthCheck() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function analyzeRepo(payload) {
  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}
