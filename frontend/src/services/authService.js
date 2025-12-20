const API_URL = "http://localhost:5000/auth";

export async function loginUser(credentials) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data.data; // { token, user }
}

export async function registerUser(payload) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error || "Registration failed");
  }

  return data.data;
}


export async function logoutUser(token) {
  const res = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json", 
    },
  });

  if (!res.ok) {
    let errorMessage = "Logout failed";
    try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
    } catch (e) {
        // Response body was likely empty or not JSON
    }
    throw new Error(errorMessage);
  }
  
  return true; 
}
