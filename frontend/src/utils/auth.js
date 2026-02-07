const API_URL = import.meta.env.VITE_API_URL;

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};

export const login = (token) => {
  localStorage.setItem("token", token);
};

export const logout = async () => {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      // Replace with your actual backend URL (e.g., /api/auth/logout)
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Send token so middleware passes
        },
      });
    }
  } catch (error) {
    console.error("Server logout failed:", error);
  } finally {
    localStorage.removeItem("token");
  }
};