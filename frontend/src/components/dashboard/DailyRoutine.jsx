import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import axios from "axios";
import confetti from "canvas-confetti";

export default function DailyRoutine() {
  const { token, user, updateUser } = useAuth(); 
  
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!token) return;
    axios.get(`${import.meta.env.VITE_API_URL}/daily/briefing`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setBriefing(res.data.data);
      // 2. CHECK BACKEND STATUS ON LOAD
      if (res.data.data.quest?.status === 'completed') {
        setIsCompleted(true);
      }
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [token]);

  const handleCompleteQuest = async () => {
    if (isCompleted || completing) return;
    setCompleting(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/daily/quest/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. SUCCESS LOGIC
      if (res.data.success) {
        setIsCompleted(true);
        
        // --- CRITICAL: INSTANT XP UPDATE ---
        // We update the global user context with the new XP returned from backend
        if (res.data.data.newXP) {
            updateUser({ ...user, xp: res.data.data.newXP });
        }

        // Trigger Visuals
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error("Quest failed:", err);
    } finally {
      setCompleting(false);
    }
  };

  // 3. Dynamic Greeting Engine
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "wb_sunny"; // Morning
    if (hour < 18) return "wb_twilight"; // Afternoon
    return "dark_mode"; // Evening
  };

  // 4. Quest Type Config
  const getQuestIcon = (type) => {
    switch (type) {
      case 'coding': return { icon: 'terminal', color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'learning': return { icon: 'menu_book', color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'social': return { icon: 'group', color: 'text-pink-400', bg: 'bg-pink-500/10' };
      default: return { icon: 'verified', color: 'text-green-400', bg: 'bg-green-500/10' };
    }
  };

  if (loading) return <SkeletonLoader />;

  const qStyle = getQuestIcon(briefing?.quest?.type || 'coding');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/10 shadow-2xl p-6 md:p-8 mb-8 group"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full group-hover:bg-blue-600/20 transition-all duration-1000 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        
        {/* LEFT: Greeting & Intel */}
        <div className="flex-1 space-y-4">
          
          {/* Badge Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 backdrop-blur-sm">
               <span className="material-symbols-outlined text-yellow-400 text-sm animate-pulse">{getTimeIcon()}</span>
               <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</span>
            </div>
            
            <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
               <span className="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
               <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">{briefing?.streak || 0} Day Streak</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.fullName?.split(' ')[0] || 'Dev'}.</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-xl">
              <span className="text-blue-400 font-bold">Today's Insight:</span> {briefing?.tip || "Consistency is the key to mastery. Keep shipping code."}
            </p>
          </div>
        </div>

        {/* RIGHT: The Active Quest Card */}
        <div className="w-full lg:w-auto min-w-[340px]">
          <motion.div 
            whileHover={{ y: -5 }}
            className={`
              relative p-[1px] rounded-2xl bg-gradient-to-r 
              ${isCompleted ? 'from-green-500 to-emerald-400' : 'from-blue-500 to-purple-500'}
            `}
          >
            <div className="bg-[#0B0F19] rounded-2xl p-5 relative overflow-hidden">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${qStyle.bg} border border-white/5`}>
                  <span className={`material-symbols-outlined ${qStyle.color}`}>{isCompleted ? 'check' : qStyle.icon}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">REWARD</p>
                  <p className="text-white font-black text-lg">+{briefing?.xpPotential || 100} XP</p>
                </div>
              </div>

              {/* Quest Content */}
              <div className="mb-5">
                <h3 className={`text-lg font-bold mb-1 ${isCompleted ? 'text-green-400 line-through opacity-70' : 'text-white'}`}>
                  {isCompleted ? "Daily Goal Achieved" : (briefing?.quest?.title || "Daily Challenge")}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {isCompleted ? "Great job! Come back tomorrow for a new directive." : (briefing?.quest?.desc || "Loading mission parameters...")}
                </p>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleCompleteQuest}
                disabled={isCompleted || completing}
                className={`
                  w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden
                  ${isCompleted 
                    ? 'bg-green-500/20 text-green-400 cursor-default border border-green-500/30' 
                    : 'bg-white text-black hover:bg-blue-50 active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  }
                `}
              >
                {completing ? (
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
              
              {isCompleted && briefing?.quest?.discussion && (
                <motion.a
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  href={briefing.quest.discussion}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">public</span>
                  SEE WHAT OTHERS ARE SAYING
                </motion.a>
              )}

            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}

// Minimal Loading State
function SkeletonLoader() {
  return (
    <div className="w-full h-64 rounded-[32px] bg-[#0f172a] border border-white/5 animate-pulse mb-8 relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"/>
    </div>
  );
}