const PROFICIENCY_SCORES = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 95,
  master: 100
};

const CATEGORY_COLORS = {
  "Frontend": "from-blue-400 to-cyan-300",
  "Backend": "from-purple-400 to-pink-300",
  "Database": "from-emerald-400 to-green-300",
  "DevOps": "from-orange-400 to-red-300",
  "General": "from-gray-200 to-white"
};

export function mapSkillForUI(skill) {
  // Logic: Ensure we handle missing images or categories gracefully
  const intensity = PROFICIENCY_SCORES[skill.proficiency?.toLowerCase()] || 40;
  
  return {
    _id: skill._id || Math.random().toString(36), // Fallback ID
    name: skill.name,
    category: skill.category || "General",
    intensity: intensity,
    // Dynamic Color Logic based on category
    colorGradient: CATEGORY_COLORS[skill.category] || CATEGORY_COLORS["General"],
    // Fallback logic for logos if file missing
    logo: skill.logo || `https://cdn.simpleicons.org/${skill.name.replace(/\s/g, '').toLowerCase()}`, 
  };
}