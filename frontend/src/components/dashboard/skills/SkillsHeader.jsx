import React from "react";
import { motion } from "framer-motion";

export default function SkillsHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
      <div className="space-y-2">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 mb-2">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
           </span>
           <span className="text-[10px] font-mono text-green-400 tracking-widest uppercase">System Online</span>
        </div>

        {/* Gradient Title */}
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-500 tracking-tight">
          Neural Skill Matrix
        </h1>
        
        <p className="text-gray-400 max-w-lg text-sm leading-relaxed border-l-2 border-blue-500/30 pl-4 mt-4">
          Manage your technical proficiency profile. This data powers your mentorship matching algorithm and portfolio visualization.
        </p>
      </div>

      {/* Decorative Stat Box (Static for now, but looks cool) */}
      <div className="hidden md:flex p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm gap-6">
         <div className="text-center">
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Sync Status</div>
            <div className="text-blue-400 font-mono font-bold">ACTIVE</div>
         </div>
         <div className="w-px bg-white/10" />
         <div className="text-center">
             <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Visibility</div>
             <div className="text-purple-400 font-mono font-bold">PUBLIC</div>
         </div>
      </div>
    </div>
  );
}