const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  // --- THE FIX: PREVENT UNAUTHORIZED REQUESTS ---
  // If we are not logging in/registering, and we have no token, STOP.
  if (!token && !path.includes("/auth/")) {
     console.warn(`🛑 Blocked request to ${path}: No token found.`);
     throw new Error("No authentication token provided");
  }
  // ----------------------------------------------

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data.data;
}