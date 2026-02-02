import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getRecommendedMatches, requestConnection } from "../../services/match.service";
import { useAuth } from "../../auth/AuthContext";

// --- CONSTANTS ---
const SWIPE_THRESHOLD = 120;
const ROTATION_RANGE = 25;

export default function NeuralMatchDeck() {
  const { token, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exitDirection, setExitDirection] = useState(null);

  // 1. Fetch & Prepare Data
  useEffect(() => {
    if (authLoading) return;
    getRecommendedMatches(token)
      .then((data) => {
        // Sanitize and add AI Reason if missing
        const enriched = data.map(m => ({
          ...m,
          reason: m.reason || generateAIReason(m.score)
        }));
        setMatches(enriched);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  // 2. Action Handler (Swipe/Click/Key)
  const handleAction = useCallback((direction) => {
    if (currentIndex >= matches.length || loading || exitDirection) return;

    setExitDirection(direction);

    // API Call (Optimistic UI)
    if (direction === "right") {
      const user = matches[currentIndex]?.user;
      if (user) requestConnection(token, user._id).catch(console.error);
    }

    // Animation Delay
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
    }, 250);
  }, [currentIndex, matches, loading, exitDirection, token]);

  // 3. Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handleAction("left");
      if (e.key === "ArrowRight") handleAction("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

  // --- RENDER STATES ---
  if (loading || authLoading) return <ScanningAnimation />;
  if (currentIndex >= matches.length) return <EmptyState />;

  // We only render the top 2 cards for performance
  const visibleMatches = matches.slice(currentIndex, currentIndex + 2).reverse();

  return (
    <div className="relative w-full h-[700px] flex flex-col items-center justify-center">

      {/* HEADER */}
      <div className="w-full max-w-sm flex justify-between items-end mb-8 px-2">
        <div>
          <h3 className="text-white text-3xl font-black uppercase tracking-tighter leading-none">
            Neural<span className="text-blue-500">Sync</span>
          </h3>
          <p className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase mt-1">
            AI Mentor Matching v2.0
          </p>
        </div>
        <div className="flex gap-2 items-center px-2 py-1 rounded bg-white/5 border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">
            {matches.length - currentIndex} Candidates
          </span>
        </div>
      </div>

      {/* CARD STACK */}
      <div className="relative w-full max-w-sm h-[480px]">
        <AnimatePresence>
          {visibleMatches.map((match, index) => {
            const isTop = index === visibleMatches.length - 1;

            return (
              <HolographicCard
                key={match.user._id}
                data={match}
                isTop={isTop}
                onSwipe={handleAction}
                forcedExit={isTop ? exitDirection : null}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-6 mt-8">
        <ControlButton icon="close" color="text-red-500" borderColor="border-red-500/30" onClick={() => handleAction("left")} />
        <ControlButton icon="favorite" color="text-emerald-500" borderColor="border-emerald-500/30" onClick={() => handleAction("right")} />
      </div>

      {/* KEYBOARD HINT */}
      <div className="mt-6 flex gap-8 opacity-30 text-[10px] uppercase tracking-widest font-mono text-white">
        <span>← REJECT</span>
        <span>CONNECT →</span>
      </div>

    </div>
  );
}

// --- SUB-COMPONENTS ---

const HolographicCard = React.memo(({ data, isTop, onSwipe, forcedExit }) => {
  const navigate = useNavigate();

  // Physics Engine
  const x = useMotionValue(0);
  const scale = useTransform(x, [-200, 200], [0.9, 0.9]); // Slight shrink on drag
  const rotate = useTransform(x, [-200, 200], [-ROTATION_RANGE, ROTATION_RANGE]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);

  // Semantic Feedback (The "Stamp")
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);
  const cardBorder = useTransform(x, [-150, 0, 150], ["rgba(239,68,68,0.5)", "rgba(255,255,255,0.1)", "rgba(16,185,129,0.5)"]);

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  const matchPercent = Math.round((data.score || 0) * 100);

  // Back Card Styles (Depth Illusion)
  const variants = {
    top: { scale: 1, y: 0, opacity: 1, zIndex: 10, filter: "blur(0px)" },
    back: { scale: 0.92, y: 30, opacity: 0.6, zIndex: 0, filter: "blur(2px)" },
    exit: (custom) => ({
      x: custom === "right" ? 500 : -500,
      opacity: 0,
      rotate: custom === "right" ? 20 : -20,
      transition: { duration: 0.25, ease: "easeIn" }
    })
  };

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        borderColor: isTop ? cardBorder : "transparent"
      }}
      variants={variants}
      initial="back"
      animate={forcedExit ? "exit" : isTop ? "top" : "back"}
      custom={forcedExit}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      className={`absolute inset-0 bg-white dark:bg-[#0f172a] rounded-[2rem] border overflow-hidden cursor-grab shadow-2xl ${isTop ? 'border-gray-200 dark:border-white/10' : 'border-transparent'}`}
    >
      {/* BACKGROUND NOISE */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      {/* SEMANTIC STAMPS (The "Tinder" Effect) */}
      {isTop && (
        <>
          <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-50 pointer-events-none border-4 border-emerald-500 rounded-lg px-4 py-2 -rotate-12 bg-black/50 backdrop-blur-md">
            <span className="text-emerald-500 font-black text-2xl tracking-widest uppercase">CONNECT</span>
          </motion.div>
          <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 z-50 pointer-events-none border-4 border-red-500 rounded-lg px-4 py-2 rotate-12 bg-black/50 backdrop-blur-md">
            <span className="text-red-500 font-black text-2xl tracking-widest uppercase">PASS</span>
          </motion.div>
        </>
      )}

      {/* --- CONTENT --- */}
      <div className="relative h-full flex flex-col p-6">

        {/* PROFILE IMAGE */}
        <div
          onClick={() => isTop && navigate(`/user/${data.user._id}`)}
          className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6 group cursor-pointer"
        >
          <img
            src={data.user.avatar || `https://ui-avatars.com/api/?name=${data.user.username}&background=0D8ABC&color=fff`}
            alt="avatar"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

          {/* Match Score Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="relative w-10 h-10">
              <svg className="w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                <circle cx="20" cy="20" r="18" stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray="113" strokeDashoffset={113 - (113 * matchPercent) / 100} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{matchPercent}%</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">{data.user.fullName}</p>
              <p className="text-gray-400 text-xs">@{data.user.username}</p>
            </div>
          </div>
        </div>

        {/* AI EXPLAINABILITY */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-blue-400 text-[14px]">psychology</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Rationale</span>
          </div>
          <p className="text-xs text-blue-200/80 leading-relaxed font-medium">
            "{data.reason}"
          </p>
        </div>

        {/* BIO */}
        <div className="flex-1">
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 italic">
            "{data.user.bio || "Searching for code, coffee, and collaboration."}"
          </p>
        </div>

        {/* SKILLS TAGS */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(data.user.skills || []).slice(0, 3).map((skill, i) => (
            <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
              {skill.name}
            </span>
          ))}
        </div>
      </div>

    </motion.div>
  );
});

function ControlButton({ icon, color, borderColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-full bg-[#0f172a] border ${borderColor} ${color} flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all shadow-xl`}
    >
      <span className="material-symbols-outlined text-2xl font-bold">{icon}</span>
    </button>
  )
}

function ScanningAnimation() {
  return (
    <div className="w-full h-[500px] flex flex-col items-center justify-center bg-[#0f172a]/30 rounded-3xl border border-white/5">
      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
      <p className="text-blue-400 font-mono text-xs tracking-[0.2em] animate-pulse">CALCULATING SYNERGY...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full h-[500px] flex flex-col items-center justify-center text-center p-8 bg-[#0f172a] rounded-[2rem] border border-white/5">
      <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-3xl text-gray-500">check_circle</span>
      </div>
      <h4 className="text-white font-bold text-xl mb-2">Queue Cleared</h4>
      <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
        You've reviewed all high-potential candidates for now. New patterns will be detected automatically.
      </p>
      <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Next Scan: 24h</span>
      </div>
    </div>
  )
}

// --- HELPER: Fake AI Reason Generator (If backend is missing it) ---
function generateAIReason(score) {
  if (score > 0.85) return "High algorithmic overlap in Frontend Architecture and System Design patterns.";
  if (score > 0.7) return "Complimentary skill set detected. Strong potential for mentorship velocity.";
  return "Based on shared interest in emerging tech stacks and recent activity trends.";
}