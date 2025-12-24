import React from "react";
import { motion } from "framer-motion";

export default function SkillTag({ skill, onRemove }) {
  // Logic: Dynamic Neon Colors based on proficiency
  const getStyleParams = (level) => {
    switch (level?.toLowerCase()) {
      case "expert":
        return "border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]";
      case "advanced":
        return "border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]";
      case "intermediate":
        return "border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]";
      case "beginner":
      default:
        return "border-gray-600/40 bg-gray-600/5 hover:bg-gray-600/10";
    }
  };

  const styleClass = getStyleParams(skill.proficiencyLabel);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.02 }}
      className={`group relative flex items-center gap-3 p-3 pr-4 rounded-xl border transition-all duration-300 backdrop-blur-md cursor-default ${styleClass}`}
    >
      {/* 1. Logo Container (Glassy look) */}
      <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center p-1.5 shadow-inner">
        <img
          src={skill.logo}
          alt={skill.name}
          className="w-full h-full object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
          onError={(e) => (e.target.style.display = "none")}
        />
      </div>

      {/* 2. Text Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-white font-bold text-sm tracking-wide truncate">
          {skill.name}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
          {skill.proficiencyLabel}
        </span>
      </div>

      {/* 3. Delete Button (Appears on Hover) */}
      <motion.button
        onClick={() => onRemove(skill.name)}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        title="Remove Skill"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </motion.button>

      {/* Decorative Glow Line at bottom */}
      <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}