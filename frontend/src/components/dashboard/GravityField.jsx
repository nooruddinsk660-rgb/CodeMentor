import React from 'react';
import { motion } from 'framer-motion';

export default function GravityField({ skills, driftWarnings = [] }) {
  // 1. SAFETY CHECK: Filter out broken skills or empty data
  const validSkills = (skills || []).map(s => ({
    ...s,
    // FIX NaN ERROR: Default to 0 if gravityScore is missing
    gravityScore: Number(s.gravityScore) || 0, 
    level: s.level || 'beginner'
  }));

  if (validSkills.length === 0) {
    return <EmptyGravityState />;
  }

  // 2. VISUAL LOGIC: Map Mass (Size) & Orbit (Distance)
  const getPlanetConfig = (index, total) => {
    const angle = (index / total) * 2 * Math.PI; // Distribute in circle
    const radius = 90 + (index % 2) * 40; // Stagger orbits
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  const getSize = (score) => {
    // 0.1 score -> 40px, 1.0 score -> 80px
    return 40 + (score * 40);
  };

  return (
    <div className="relative h-[400px] w-full rounded-[32px] bg-[#030712] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
       {/* Header */}
       <div className="absolute top-6 left-6 z-20">
          <h3 className="text-white font-black text-lg flex items-center gap-2 tracking-wide">
            <span className="text-2xl">🪐</span> GRAVITY WELL
          </h3>
          <p className="text-xs text-blue-400 font-mono mt-1">
            {validSkills.length} ORBITING SKILL BODIES
          </p>
       </div>

       {/* Warnings (Drift) */}
       {driftWarnings.length > 0 && (
         <div className="absolute top-6 right-6 z-20">
            <span className="bg-red-500/10 border border-red-500/50 text-red-400 text-[10px] font-bold px-3 py-1.5 rounded-full animate-pulse flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500"/>
               {driftWarnings.length} ORBIT DECAY
            </span>
         </div>
       )}

       {/* The "Universe" Container */}
       <div className="absolute inset-0 flex items-center justify-center">
          
          {/* Central Black Hole (The User) */}
          <div className="absolute w-24 h-24 bg-blue-600/20 rounded-full blur-[50px] animate-pulse" />
          <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_30px_white]" />

          {/* Floating Planets */}
          {validSkills.slice(0, 8).map((skill, i) => {
             const { x, y } = getPlanetConfig(i, Math.min(validSkills.length, 8));
             const size = getSize(skill.gravityScore);
             const isDecaying = skill.gravityScore < 0.2 && skill.level !== 'beginner';
             
             // Dynamic Colors
             const color = isDecaying 
                ? 'bg-red-500 shadow-red-500/50' 
                : 'bg-blue-500 shadow-blue-500/50';

             return (
                <motion.div
                  key={skill.name || i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: 1, 
                    x: x, 
                    y: y,
                  }}
                  transition={{ 
                    delay: i * 0.1, 
                    type: "spring", 
                    stiffness: 100 
                  }}
                  // Floating Animation
                  style={{ width: size, height: size }}
                  className={`absolute rounded-full flex items-center justify-center cursor-pointer group z-10`}
                >
                    {/* Planet Glow */}
                    <div className={`absolute inset-0 rounded-full opacity-30 blur-md ${color.split(' ')[0]}`} />
                    
                    {/* Planet Core */}
                    <div className={`relative w-full h-full rounded-full border border-white/20 backdrop-blur-md bg-white/5 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 shadow-lg ${color.split(' ')[1]}`}>
                        <span className="text-[10px] font-bold text-white truncate px-1 shadow-black drop-shadow-md">
                            {skill.name}
                        </span>
                    </div>

                    {/* Hover Stats Tooltip */}
                    <div className="absolute -top-12 bg-[#0F172A] border border-white/10 px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center min-w-[80px] z-50">
                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Mass</span>
                        <span className="text-xs font-bold text-white">
                           {/* FIX: No more NaN%g */}
                           {Math.round(skill.gravityScore * 100)}% G
                        </span>
                    </div>
                </motion.div>
             );
          })}
       </div>
       
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
    </div>
  );
}

function EmptyGravityState() {
    return (
        <div className="h-[400px] rounded-[32px] bg-[#030712] border border-white/10 flex flex-col items-center justify-center text-center p-8">
            <span className="text-4xl mb-4 grayscale opacity-50">🌑</span>
            <h3 className="text-gray-400 font-bold text-lg">Void Detected</h3>
            <p className="text-gray-600 text-sm mt-2 max-w-xs">
                Add skills to generate your gravitational mass.
            </p>
        </div>
    );
}