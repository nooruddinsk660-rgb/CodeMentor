import React from 'react';
import { motion } from 'framer-motion';

export default function TrajectoryCard({ intelligence }) {
  // 1. SMART FALLBACK ENGINE
  // If intelligence is null/undefined, we pretend we are "Calibrating" instead of showing nothing.
  const hasData = intelligence && intelligence.status === 'success';
  
  const headline = hasData 
    ? (intelligence.trajectory === 'accelerating' ? "Hyper-Growth Detected" : "Stable Trajectory")
    : "Calibrating Neural Net...";

  const description = hasData
    ? intelligence.ai_analysis
    : "Analyzing your skill vectors. Continue coding to build prediction confidence.";

  const velocity = hasData ? Math.round(intelligence.gravity_index * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-8 rounded-[32px] bg-[#0B0F19] border border-white/10 shadow-2xl overflow-hidden group"
    >
      {/* Background Radar Animation */}
      <div className="absolute -right-20 -top-20 w-64 h-64 border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
      <div className="absolute -right-20 -top-20 w-64 h-64 border border-blue-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        
        {/* Left: The Radar Visualizer */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            {/* Spinning Rings */}
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full border-t-cyan-400 animate-spin" />
            <div className="absolute inset-4 border-2 border-purple-500/30 rounded-full border-b-purple-400 animate-[spin_3s_linear_infinite_reverse]" />
            
            {/* Center Value */}
            <div className="text-center bg-[#0B0F19] rounded-full p-2 relative z-10">
                <span className="text-3xl font-black text-white tracking-tight">{velocity}</span>
                <p className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold">VELOCITY</p>
            </div>
        </div>

        {/* Right: The Text Context */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
             <span className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`} />
             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                {hasData ? "LIVE ANALYSIS" : "SYSTEM IDLE"}
             </h4>
          </div>
          
          <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
             {headline}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-white/10 pl-4">
             "{description}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}