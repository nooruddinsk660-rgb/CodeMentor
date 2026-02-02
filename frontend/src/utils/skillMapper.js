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


const SKILL_SLUG_MAP = {
  "c++": "cplusplus",
  "c#": "csharp",
  "cpp": "cplusplus",
  "csharp": "csharp",
  "jupyter notebook": "jupyter",
  "jupyter": "jupyter",
  "node.js": "nodedotjs",
  "nodejs": "nodedotjs",
  "express": "express",
  "express.js": "express",
  "react": "react",
  "react.js": "react",
  "vue": "vuedotjs",
  "vue.js": "vuedotjs",
  "angular": "angular",
  "next.js": "nextdotjs",
  "aws": "amazonaws",
  "amazon web services": "amazonaws",
  "gcp": "googlecloud",
  "google cloud": "googlecloud",
  ".net": "dotnet",
  "dotnet": "dotnet",
  "visual studio code": "visualstudiocode",
  "vscode": "visualstudiocode",
  "type": "typescript", // Artifact from "TypeScript" splitting?
  "typescript": "typescript",
  "java": "openjdk", // "java" often issues 404 due to trademark, openjdk is safe
  "javascript": "javascript",
  "js": "javascript",
  "python": "python",
  "py": "python",
  "jupyter notebook": "jupyter",
  "jupyternotebook": "jupyter", // Fix for no-space variant
  "jupyter": "jupyter",
  "html": "html5",
  "css": "css3",
  "git": "git",
  "github": "github",
  "docker": "docker",
  "mongodb": "mongodb",
  "postgres": "postgresql",
  "postgresql": "postgresql",
};

export function mapSkillForUI(skill) {
  // Logic: Ensure we handle missing images or categories gracefully
  const intensity = PROFICIENCY_SCORES[skill.proficiency?.toLowerCase()] || 40;

  const normalizedName = skill.name.toLowerCase().trim();
  const slug = SKILL_SLUG_MAP[normalizedName] || skill.name.replace(/\s/g, '').replace(/\./g, '').toLowerCase();

  return {
    _id: skill._id || Math.random().toString(36), // Fallback ID
    name: skill.name,
    category: skill.category || "General",
    intensity: intensity,
    // Dynamic Color Logic based on category
    colorGradient: CATEGORY_COLORS[skill.category] || CATEGORY_COLORS["General"],
    // Fallback logic for logos if file missing
    // Force regenerate if it's a generated simpleicon, to ensure we use the correct slug
    logo: (skill.logo && !skill.logo.includes('cdn.simpleicons.org'))
      ? skill.logo
      : `https://cdn.simpleicons.org/${slug}`,
  };
}