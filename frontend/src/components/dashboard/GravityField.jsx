import React from 'react';
import { motion } from 'framer-motion';

const GravityField = ({ skills, driftWarnings }) => {
  return (
    <div className="bg-card-dark border border-border-dark p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🪐</span> Skill Gravity
        </h3>
        {driftWarnings.length > 0 && (
          <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full animate-pulse border border-red-500/50">
            ⚠️ {driftWarnings.length} Skills Decaying
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => {
          // Determine color based on Gravity Score (not just level)
          const isDecaying = skill.gravityScore < 0.5 && skill.level !== 'beginner';
          const isHighGravity = skill.gravityScore > 0.8;
          
          let colorClass = "bg-gray-600";
          if (isDecaying) colorClass = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
          else if (isHighGravity) colorClass = "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]";
          else colorClass = "bg-blue-500";

          return (
            <div key={skill.name} className="group relative bg-background-dark p-3 rounded-lg border border-border-dark hover:border-gray-500 transition-colors">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-200 font-medium">{skill.name}</span>
                <span className={`text-xs ${isDecaying ? 'text-red-400' : 'text-cyan-400'}`}>
                  {isDecaying ? '📉 Drifting' : `${Math.round(skill.gravityScore * 100)}% G`}
                </span>
              </div>
              
              {/* Gravity Bar */}
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(skill.gravityScore * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${colorClass}`}
                />
              </div>

              {/* Tooltip for Decay */}
              {isDecaying && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 bg-red-900/90 text-white text-xs p-2 rounded hidden group-hover:block z-10 text-center border border-red-500">
                  Skill is fading! Use it soon.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GravityField;