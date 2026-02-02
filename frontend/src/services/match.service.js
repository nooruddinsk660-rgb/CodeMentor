const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getRecommendedMatches(token) {
  // ✅ FIX: Use '/matchmaking' to match backend route
  const res = await fetch(`${API_BASE_URL}/matchmaking/recommendations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load recommendations");

  return data.data;
}

export async function requestConnection(token, userId, message = "I'd like to connect!") {
  // ✅ FIX: Use '/connect/request' to match backend route
  const res = await fetch(`${API_BASE_URL}/connect/request`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // ✅ FIX 2: Send 'recipientId' in the body (matches Backend Controller)
    body: JSON.stringify({
      recipientId: userId,
      message: message
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Connection request failed");
  return data;
}