export async function getUserStatistics(token, userId) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/users/${userId}/statistics`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch statistics");
  }

  return data.data;
}
