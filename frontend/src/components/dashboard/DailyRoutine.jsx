import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import confetti from "canvas-confetti";
import { generateDailyQuests } from "../../utils/questGenerator";
import { apiRequest } from "../../api/client";

export default function DailyRoutine({ intelligence, skills, streak }) {
  const { user, updateUser } = useAuth();
  
  const [quests, setQuests] = useState([]);
  const [activeQuest, setActiveQuest] = useState(null);
  const [completedQuests, setCompletedQuests] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Generate Quests
  useEffect(() => {
    if (skills && skills.length > 0) {
      const generated = generateDailyQuests(intelligence, skills, streak);
      setQuests(generated);
      setActiveQuest(generated[0]);
    }
  }, [intelligence, skills, streak]);

  // --- 🧠 FIX: CHECK IF ALREADY COMPLETED ON LOAD ---
  useEffect(() => {
    if (user?.dailyLog?.lastQuestDate && activeQuest) {
      const today = new Date().toDateString();
      const lastDate = new Date(user.dailyLog.lastQuestDate).toDateString();

      // If the dates match, it means we finished the daily quest!
      if (today === lastDate) {
        setCompletedQuests(prev => ({ ...prev, [activeQuest.id]: true }));
      }
    }
  }, [user, activeQuest]); // Run this check whenever user or quest loads
  // --------------------------------------------------

  const handleCompleteQuest = async (questId) => {
    if (completedQuests[questId] || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await apiRequest("/daily/quest/complete", {
        method: "POST",
        body: JSON.stringify({ 
            questId: questId, 
            xp: activeQuest.xp 
        }),
      });

      // Even if backend says "Already completed", we mark it as done locally
      if (response) {
        if (response.success) {
             confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
        
        setCompletedQuests(prev => ({ ...prev, [questId]: true }));

        // Update Context so XP bar stays high
        if (response.newXP) {
            updateUser({ 
                ...user, 
                xp: response.newXP,
                dailyLog: { 
                    ...(user.dailyLog || {}),
                    currentStreak: response.newStreak || user.dailyLog?.currentStreak || 1,
                    lastQuestDate: new Date() // FORCE UPDATE LOCAL DATE
                }
            });
        }
      }
    } catch (error) {
      console.error("Quest completion failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (Keep the rest of your UI code exactly the same) ...
  // Helper functions: getGreeting, getTimeIcon, getQuestStyle...
  // The JSX return...

  // --------------------------------------------------------
  // (Paste the existing helper functions and JSX below if needed, 
  // or just keep what you had, as only the useEffect above changed)
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "wb_sunny"; 
    if (hour < 18) return "wb_twilight"; 
    return "dark_mode";
  };

  const getQuestStyle = (type) => {
    switch (type) {
      case 'RECOVERY': return { icon: 'ambulance', color: 'text-red-400', bg: 'bg-red-500/10', gradient: 'from-red-500/20 to-orange-500/20' };
      case 'DEEP_DIVE': return { icon: 'rocket_launch', color: 'text-cyan-400', bg: 'bg-cyan-500/10', gradient: 'from-cyan-500/20 to-blue-500/20' };
      default: return { icon: 'verified', color: 'text-green-400', bg: 'bg-green-500/10', gradient: 'from-green-500/20 to-emerald-500/20' };
    }
  };

  if (!activeQuest) return <SkeletonLoader />;

  const qStyle = getQuestStyle(activeQuest.type);
  const isCompleted = completedQuests[activeQuest.id];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/10 shadow-2xl p-6 md:p-8 mb-8 group"
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full group-hover:bg-blue-600/20 transition-all duration-1000 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 backdrop-blur-sm">
               <span className="material-symbols-outlined text-yellow-400 text-sm animate-pulse">{getTimeIcon()}</span>
               <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
               <span className="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
               <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">{streak || 0} Day Streak</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.fullName?.split(' ')[0] || 'Dev'}.</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-xl">
              <span className="text-blue-400 font-bold">AI Intelligence:</span> {intelligence?.ai_analysis || "Analyzing skill vectors..."}
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            {quests.map(q => (
                <button 
                    key={q.id}
                    onClick={() => setActiveQuest(q)}
                    className={`h-2 w-8 rounded-full transition-all ${activeQuest.id === q.id ? 'bg-blue-500 w-12' : 'bg-white/10 hover:bg-white/20'}`}
                />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-auto min-w-[340px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeQuest.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`relative p-[1px] rounded-2xl bg-gradient-to-r ${qStyle.gradient}`}
            >
              <div className="bg-[#0B0F19] rounded-2xl p-5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${qStyle.bg} border border-white/5`}>
                    <span className={`material-symbols-outlined ${qStyle.color}`}>{isCompleted ? 'check' : qStyle.icon}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">REWARD</p>
                    <p className="text-white font-black text-lg">+{activeQuest.xp} XP</p>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className={`text-lg font-bold mb-1 ${isCompleted ? 'text-green-400 line-through opacity-70' : 'text-white'}`}>
                    {isCompleted ? "Objective Complete" : activeQuest.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {isCompleted ? "Great work! Select another mission." : activeQuest.desc}
                  </p>
                </div>

                <button 
                  onClick={() => handleCompleteQuest(activeQuest.id)}
                  disabled={isCompleted || isSubmitting}
                  className={`
                    w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden
                    ${isCompleted 
                      ? 'bg-green-500/20 text-green-400 cursor-default border border-green-500/30' 
                      : 'bg-white text-black hover:bg-blue-50 active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    }
                    ${isSubmitting ? 'opacity-70 cursor-wait' : ''}
                  `}
                >
                  {isSubmitting ? (
                     <span className="flex items-center justify-center gap-2">
                       <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                       SYNCING...
                     </span>
                  ) : isCompleted ? (
                     <span className="flex items-center justify-center gap-2">
                       <span className="material-symbols-outlined text-sm font-black">check_circle</span>
                       MISSION COMPLETE
                     </span>
                  ) : (
                     "MARK AS COMPLETE"
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonLoader() {
  return (
    <div className="w-full h-64 rounded-[32px] bg-[#0f172a] border border-white/5 animate-pulse mb-8 relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"/>
    </div>
  );
}