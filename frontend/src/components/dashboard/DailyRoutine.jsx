import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import confetti from "canvas-confetti";
import { apiRequest } from "../../api/client";

export default function DailyRoutine({ streak }) { // streak prop is now a fallback
  const { user, updateUser } = useAuth();
  
  const [activeQuest, setActiveQuest] = useState(null);
  const [intelData, setIntelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 🧠 FIXED LOGIC: TRUST USER CONTEXT FIRST ---
  // We use || instead of ?? so if the first value is 0, it tries the next one.
  // BUT we prioritize 'user.dailyLog' because we know 'ProgressSection' uses it and it's correct (2).
  const displayStreak = user?.dailyLog?.currentStreak || intelData?.streak || streak || 0;
  // ------------------------------------------------

  useEffect(() => {
    const fetchDailyBriefing = async () => {
      try {
        const data = await apiRequest("/daily/briefing");
        if (data) {
           setActiveQuest(data.quest);
           setIntelData(data);
           if (data.quest.status === 'completed') {
             setIsCompleted(true);
           }
        }
      } catch (err) {
        console.error("Briefing Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyBriefing();
  }, []);

  // --- MEMORY CHECK (Keeps 'Completed' status on refresh) ---
  useEffect(() => {
    if (user?.dailyLog?.lastQuestDate && activeQuest) {
      const today = new Date().toDateString();
      const lastDate = new Date(user.dailyLog.lastQuestDate).toDateString();

      if (today === lastDate) {
        setIsCompleted(true);
      }
    }
  }, [user, activeQuest]);

  const handleCompleteQuest = async () => {
    if (isCompleted || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await apiRequest("/daily/quest/complete", {
        method: "POST",
        body: JSON.stringify({ xp: 100 }), 
      });

      if (response) {
        if (response.message !== 'Already completed today') {
             confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
        
        setIsCompleted(true);

        if (response.newXP) {
            updateUser({ 
                ...user, 
                xp: response.newXP,
                dailyLog: { 
                    ...(user.dailyLog || {}),
                    currentStreak: response.newStreak || user.dailyLog?.currentStreak || 1,
                    lastQuestDate: new Date()
                }
            });
        }
      }
    } catch (error) {
      console.error("Completion failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Helpers ---
  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  };

  const getQuestStyle = (type) => {
    switch (type) {
      case 'learning': return ['menu_book', 'text-purple-400', 'bg-purple-500/10', 'from-purple-500/20 to-blue-600/20'];
      case 'social': return ['group', 'text-pink-400', 'bg-pink-500/10', 'from-pink-500/20 to-rose-600/20'];
      case 'wellness': return ['self_improvement', 'text-emerald-400', 'bg-emerald-500/10', 'from-emerald-500/20 to-teal-600/20'];
      default: return ['terminal', 'text-cyan-400', 'bg-cyan-500/10', 'from-cyan-500/20 to-blue-600/20'];
    }
  };

  if (loading || !activeQuest) return <SkeletonLoader />;

  const [qIcon, qTextColor, qBgColor, qGradient] = getQuestStyle(activeQuest.type);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/10 shadow-2xl p-6 md:p-8 mb-8 group"
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full group-hover:bg-blue-600/20 transition-all duration-1000 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-8">
        
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
             {/* 🔥 CORRECT STREAK BADGE 🔥 */}
             <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
                <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">{displayStreak} Day Streak</span>
             </div>

             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 backdrop-blur-sm">
                <span className="material-symbols-outlined text-blue-400 text-sm">calendar_today</span>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</span>
             </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.fullName?.split(' ')[0] || 'Dev'}.</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-xl border-l-2 border-blue-500/30 pl-4 italic">
               "{intelData?.tip || "Consistency is the foundation of mastery."}"
            </p>
          </div>
        </div>

        <div className="w-full lg:w-[400px]">
          <AnimatePresence mode="wait">
            <motion.div 
              layout
              key={activeQuest.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative p-[1px] rounded-2xl bg-gradient-to-br ${qGradient}`}
            >
              <div className="bg-[#0B0F19]/90 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${qBgColor} border border-white/5 shadow-inner`}>
                    <span className={`material-symbols-outlined ${qTextColor}`}>{isCompleted ? 'check_circle' : qIcon}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">REWARD</p>
                    <p className="text-white font-black text-xl tracking-tight">+{intelData?.xpPotential || 100} XP</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-2 transition-all duration-300 ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                    {isCompleted ? "Objective Secured" : activeQuest.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {isCompleted ? "Great job. Access your resources below." : activeQuest.desc}
                  </p>
                </div>

                <button 
                  onClick={handleCompleteQuest}
                  disabled={isCompleted || isSubmitting}
                  className={`
                    w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden
                    flex items-center justify-center gap-2
                    ${isCompleted 
                      ? 'bg-green-500/10 text-green-400 cursor-default border border-green-500/20' 
                      : 'bg-white text-black hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                    }
                  `}
                >
                  {isSubmitting ? (
                     <>
                       <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                       <span>SYNCING...</span>
                     </>
                  ) : isCompleted ? (
                     <>
                       <span className="material-symbols-outlined text-sm font-black">verified</span>
                       <span>MISSION COMPLETE</span>
                     </>
                  ) : (
                     "MARK AS COMPLETE"
                  )}
                </button>

                <AnimatePresence>
                  {isCompleted && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden flex flex-col gap-2"
                    >
                        <div className="h-px w-full bg-white/10 mb-2" />
                        
                        {(activeQuest.link || activeQuest.discussion) ? (
                            <>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">UNLOCKED RESOURCES</p>
                                <div className="flex gap-3">
                                    {activeQuest.link && (
                                    <a 
                                        href={activeQuest.link} target="_blank" rel="noopener noreferrer"
                                        className="flex-1 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center gap-2 border border-blue-500/20 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">article</span>
                                        Read
                                    </a>
                                    )}
                                    {activeQuest.discussion && (
                                    <a 
                                        href={activeQuest.discussion} target="_blank" rel="noopener noreferrer"
                                        className="flex-1 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center gap-2 border border-purple-500/20 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">forum</span>
                                        Discuss
                                    </a>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-gray-500 italic text-center">No additional resources for this quest.</p>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>

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
    <div className="w-full h-72 rounded-[32px] bg-[#0f172a] border border-white/5 animate-pulse mb-8 relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"/>
    </div>
  );
}