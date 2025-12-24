const API_BASE_URL = import.meta.env.VITE_API_URL;

// 1. Get User's Personal Skills
export async function getAllSkills(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me/skills`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch skills");
    return json.data || [];
  } catch (error) {
    console.error("Skill Service Error:", error);
    return []; 
  }
}

// 2. Get Master List
export async function getMasterSkillList(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/skills`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch master list");
    return json.data || [];
  } catch (error) {
    console.error("Master List Fetch Error:", error);
    return []; 
  }
}

// 3. Update Skills (FIXED: Removed 'intensity')
export async function updateUserSkills(token, skills) {
  try {
    // Transform UI data back to Backend format
    const payload = skills.map(s => ({
      name: s.name,
      // Check both formats to be safe
      proficiency: (s.proficiencyLabel || s.proficiency || 'intermediate').toLowerCase(), 
      category: s.category || 'General',
      logo: s.logo || ''
      // ❌ REMOVED 'intensity' because the backend validation rejects it
    }));

    const res = await fetch(`${API_BASE_URL}/users/me/skills`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ skills: payload }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend Validation Error Details:", errorData);
        throw new Error(errorData.error || "Sync failed");
    }
    
    const json = await res.json();
    return json.data.skills || [];
    
  } catch (error) {
    console.error("Update Skills Error:", error);
    throw error;
  }
}