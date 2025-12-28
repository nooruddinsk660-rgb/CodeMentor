const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getRecommendedMatches(token) {
  // ✅ FIX: Use '/matches' (plural) to match backend route
  const res = await fetch(`${API_BASE_URL}/matches/recommendations`, {
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
  // ✅ FIX 1: URL should be just '/request', not '/request/:id'
  const res = await fetch(`${API_BASE_URL}/matches/request`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // ✅ FIX 2: Send 'targetUserId' in the body (matches Backend Controller)
    body: JSON.stringify({ 
        targetUserId: userId, 
        message: message 
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Connection request failed");
  return data;
}