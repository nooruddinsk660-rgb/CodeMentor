import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Using CDN for reliable SVG logos (e.g., jsdelivr with devicon or svgporn)
const initialSkills = [
  { name: "Python", intensity: 80, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "JavaScript", intensity: 70, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "React", intensity: 90, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  // Using PostgreSQL icon as a good representative for SQL
  { name: "SQL", intensity: 60, category: "Database", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { name: "Node.js", intensity: 50, category: "Backend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "TypeScript", intensity: 80, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "Docker", intensity: 40, category: "DevOps", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  // Using standard AWS logo
  { name: "AWS", intensity: 70, category: "Cloud", logo: "https://cdn.svgporn.com/logos/aws.svg" },
  { name: "HTML5/CSS3", intensity: 30, category: "Frontend", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "Jest", intensity: 50, category: "Testing", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg" },
  { name: "GraphQL", intensity: 60, category: "API", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
  // Using Jenkins as representative for CI/CD
  { name: "CI/CD", intensity: 20, category: "DevOps", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg" }
];

export default function SkillsGrid() {
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("intensity");
  const [selectedSkill, setSelectedSkill] = useState(null);

  const filteredSkills = useMemo(() => {
    return initialSkills
      .filter((s) => s.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "intensity") return b.intensity - a.intensity;
        return a.name.localeCompare(b.name);
      });
  }, [filter, sortBy]);

  // Helper to get color based on intensity for the details panel
  const getIntensityColor = (intensity) => {
      if (intensity >= 80) return "from-green-500 to-emerald-400";
      if (intensity >= 60) return "from-blue-500 to-cyan-400";
      if (intensity >= 40) return "from-yellow-500 to-orange-400";
      return "from-red-500 to-pink-400";
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0B0F19] border border-white/10 shadow-2xl overflow-hidden relative">
      {/* Background accent glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h3 className="text-white text-xl font-black tracking-tight flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 material-symbols-outlined">hub</span>
            Technologies
            </h3>
            <p className="text-gray-400 text-sm mt-1">Interactive skills matrix and proficiency.</p>
        </div>

        <div className="flex gap-3 p-1 bg-white/5 rounded-xl border border-white/10">
          {/* Search Input */}
          <div className="relative flex-1 md:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search skills..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-40 bg-transparent border-r border-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:text-blue-400 transition-colors"
            />
          </div>

          {/* Sort Button */}
          <button 
            onClick={() => setSortBy(sortBy === "intensity" ? "name" : "intensity")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">{sortBy === "intensity" ? "sort" : "sort_by_alpha"}</span>
            <span className="hidden sm:inline">{sortBy === "intensity" ? "Level" : "Name"}</span>
          </button>
        </div>
      </div>

      {/* 2. The Logo Grid */}
      <motion.div layout className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill) => (
            <LogoCard 
              key={skill.name} 
              skill={skill} 
              isSelected={selectedSkill?.name === skill.name}
              onClick={() => setSelectedSkill(skill)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* 3. Details Panel */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden"
          >
             {/* Close button */}
             <button 
                  onClick={() => setSelectedSkill(null)}
                  className="absolute top-4 right-4 p-1 rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
            >
                <span className="material-symbols-outlined text-sm block">close</span>
            </button>

            <div className="flex items-center gap-4 mb-4 relative z-10">
                 {/* Large Logo in Details */}
                 <div className="p-3 bg-white/10 rounded-xl md:w-20 md:h-20 flex items-center justify-center">
                    <img src={selectedSkill.logo} alt={selectedSkill.name} className="w-12 h-12 object-contain" />
                 </div>
                <div>
                    <h4 className="text-white font-black text-2xl tracking-tight">{selectedSkill.name}</h4>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{selectedSkill.category}</span>
                </div>
            </div>

            <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Proficiency</span>
                    <span className="text-white font-bold">{selectedSkill.intensity}%</span>
                </div>
                {/* Animated Progress Bar with dynamic color */}
                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden p-[2px]">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedSkill.intensity}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${getIntensityColor(selectedSkill.intensity)}`}
                    />
                </div>
            </div>
             {/* Subtle background Tint in details based on skill color */}
             <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${getIntensityColor(selectedSkill.intensity)} z-0 pointer-events-none`}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for individual Logo Card
function LogoCard({ skill, onClick, isSelected }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300
        ${isSelected 
            ? "bg-blue-900/30 border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]" 
            : "bg-[#111625] border-white/5 hover:border-white/20 hover:bg-[#161b2c]"
        }
      `}
    >
      {/* Logo Container */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* The Logo Image */}
        <img 
            src={skill.logo} 
            alt={skill.name} 
            // Grayscale by default, color on hover or selection
            className={`w-full h-full object-contain transition-all duration-300 ${isSelected ? 'grayscale-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'grayscale group-hover:grayscale-0 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] opacity-80 group-hover:opacity-100'}`}
        />
      </div>

      {/* Name Label */}
      <span className={`text-xs font-bold tracking-wide transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
        {skill.name}
      </span>

       {/* Intensity Badge (Top Right Corner) */}
       <div className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-md transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-500 group-hover:bg-white/20 group-hover:text-gray-300'}`}>
          {skill.intensity}
       </div>
    </motion.button>
  );
}