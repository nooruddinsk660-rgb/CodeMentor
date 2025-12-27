import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom"; // <--- 1. Import Navigation
import { getRecommendedMatches, requestConnection } from "../../services/match.service";
import { useAuth } from "../../auth/AuthContext";

export default function NeuralMatchDeck() {
  const { token, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exitDirection, setExitDirection] = useState(null); // Track button actions

  useEffect(() => {
    if (authLoading) return;
    getRecommendedMatches(token)
      .then((data) => setMatches(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  // --- 2. Handle Actions (Swipe OR Button Click) ---
  const handleAction = useCallback((direction) => {
    if (currentIndex >= matches.length || loading) return;

    setExitDirection(direction);

    // Call API if "Like" (Right)
    if (direction === "right") {
        const user = matches[currentIndex]?.user;
        if (user) requestConnection(token, user._id).catch(console.error);
    }

    // Animation Delay
    setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setExitDirection(null);
    }, 200);
  }, [currentIndex, matches, loading, token]);

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") handleAction("left");
        if (e.key === "ArrowRight") handleAction("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

  if (loading || authLoading) return <ScanningAnimation />;
  if (currentIndex >= matches.length) return <EmptyState />;

  return (
    <div className="relative w-full h-[650px] flex flex-col items-center justify-center">
      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-end mb-6 px-2">
        <div>
           <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 text-[24px] font-black uppercase tracking-wider">
            Neural Sync
          </h3>
          <p className="text-xs text-blue-300/60 font-mono">AI-POWERED MENTOR MATCHING</p>
        </div>
        <div className="flex gap-1 items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <span className="text-[10px] text-green-400 font-mono tracking-widest">LIVE</span>
        </div>
      </div>

      {/* 3D Card Stack */}
      <div className="relative w-full max-w-sm h-[420px]">
        <AnimatePresence>
          {matches.slice(currentIndex, currentIndex + 2).reverse().map((match, index) => {
            const isTop = index === 1; 
            const actualIsTop = match === matches[currentIndex];
            
            return (
              <HolographicCard 
                key={match.user._id}
                data={match}
                isTop={actualIsTop}
                onSwipe={(dir) => handleAction(dir)}
                forcedExit={actualIsTop ? exitDirection : null}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* --- 3. NEW: Action Buttons --- */}
      <div className="flex gap-8 mt-10">
        <button 
            onClick={() => handleAction("left")}
            className="w-16 h-16 rounded-full bg-[#0f172a] border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/10 hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        >
            <span className="material-symbols-outlined text-3xl">close</span>
        </button>

        <button 
            onClick={() => handleAction("right")}
            className="w-16 h-16 rounded-full bg-[#0f172a] border border-green-500/30 text-green-500 flex items-center justify-center hover:bg-green-500/10 hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        >
            <span className="material-symbols-outlined text-3xl">favorite</span>
        </button>
      </div>

    </div>
  );
}

// --- Sub-component: The 3D Card ---
function HolographicCard({ data, isTop, onSwipe, forcedExit }) {
  const navigate = useNavigate(); // Hook for navigation
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const border = useTransform(x, [-150, 0, 150], ["1px solid rgba(239,68,68,0.5)", "1px solid rgba(59,130,246,0.3)", "1px solid rgba(34,197,94,0.5)"]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) onSwipe("right");
    else if (info.offset.x < -100) onSwipe("left");
  };

  const matchPercent = Math.round((data.score || 0) * 100); 

  return (
    <motion.div
      style={{ x, rotate, opacity, border: isTop ? border : "none", zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      
      // Handle Forced Exit (Button Clicks)
      animate={forcedExit ? { x: forcedExit === "right" ? 500 : -500, opacity: 0 } : { scale: 1, y: 0, opacity: 1 }}
      initial={{ scale: 0.9, y: 20, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      
      className={`absolute inset-0 bg-[#0f172a]/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10 ${!isTop && "pointer-events-none grayscale opacity-40"}`}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />

      {/* Match Score */}
      <div className="absolute top-4 right-4 flex items-center justify-center w-14 h-14">
        <svg className="w-full h-full -rotate-90">
            <circle cx="28" cy="28" r="26" stroke="#1e293b" strokeWidth="4" fill="none" />
            <circle cx="28" cy="28" r="26" stroke={matchPercent > 80 ? "#10b981" : "#3b82f6"} strokeWidth="4" fill="none" strokeDasharray="163" strokeDashoffset={163 - (163 * matchPercent) / 100} strokeLinecap="round" />
        </svg>
        <span className="absolute text-xs font-bold text-white">{matchPercent}%</span>
      </div>

      <div className="relative z-10 flex flex-col h-full mt-4">
        {/* --- 4. CLICKABLE PROFILE AREA --- */}
        <div 
            onClick={() => isTop && navigate(`/user/${data.user._id}`)}
            className="group cursor-pointer"
        >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px] shadow-lg shadow-blue-500/20 mb-4 group-hover:scale-105 transition-transform">
                <img 
                    src={data.user.avatar || `https://ui-avatars.com/api/?name=${data.user.username}&background=0D8ABC&color=fff`} 
                    alt="avatar" 
                    className="w-full h-full rounded-2xl object-cover bg-gray-900"
                />
            </div>
            <h2 className="text-2xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors underline-offset-4 group-hover:underline">
                {data.user.fullName}
            </h2>
        </div>

        <p className="text-blue-400 text-sm font-medium mb-4 flex items-center gap-2">
            @{data.user.username}
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300">
                Lvl {data.user.level || 1}
            </span>
        </p>

        <p className="text-gray-400 text-sm line-clamp-3 mb-6 italic leading-relaxed">
            "{data.user.bio || "Ready to collaborate and build amazing things."}"
        </p>

        <div className="mt-auto">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Top Synergies</p>
            <div className="flex flex-wrap gap-2">
                {(data.user.skills || []).slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-medium">
                        {skill.name}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </motion.div>
  );
}

// Keep Animations and EmptyState...
function ScanningAnimation() {
  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center relative overflow-hidden rounded-3xl bg-[#0f172a]/30 border border-white/5">
      <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
      <div className="w-full h-1 bg-blue-500/50 absolute top-0 shadow-[0_0_15px_#3b82f6] animate-[scan_2s_ease-in-out_infinite]" />
      <p className="text-blue-400 font-mono text-sm animate-pulse tracking-widest">SCANNING NEURAL NETWORK...</p>
      <style>{`@keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
    </div>
  );
}

function EmptyState() {
    return (
        <div className="w-full h-[400px] flex flex-col items-center justify-center text-center p-6 border border-white/5 rounded-3xl bg-[#0f172a]/30">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
            </div>
            <h4 className="text-white font-bold text-lg mb-2">All Caught Up!</h4>
            <p className="text-gray-400 text-sm">You've scanned all current recommendations.</p>
        </div>
    )
}