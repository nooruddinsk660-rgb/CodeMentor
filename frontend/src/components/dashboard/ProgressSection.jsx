import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { getUserStatistics } from "../../services/userStatistics.service";

export default function ProgressSection() {
  const { token, user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    xp: 0,
    level: 1,
    activeStreak: 0,
    statistics: { totalMatches: 0, successfulMatches: 0, hoursContributed: 0 }
  });
  const [loading, setLoading] = useState(true);

  // 1. LIVE DATA RESOLUTION (Single Source of Truth)
  const currentXP = user?.xp ?? stats.xp ?? 0;
  const currentLevel = user?.level ?? stats.level ?? 1;
  const currentStreak = user?.dailyLog?.currentStreak ?? stats.activeStreak ?? 0;

  // 2. MOMENTUM ENGINE (Derived State)
  const momentumStatus = useMemo(() => {
    if (currentStreak > 7) return { label: "HIGH VELOCITY", color: "text-emerald-400", dot: "bg-emerald-500" };
    if (currentStreak > 3) return { label: "GAINING MOMENTUM", color: "text-blue-400", dot: "bg-blue-500" };
    return { label: "STABLE", color: "text-gray-400", dot: "bg-gray-500" };
  }, [currentStreak]);

  // 3. PROGRESS CALCULATION
  const { progress, nextLevelXP, isCloseToLevelUp } = useMemo(() => {
    const baseXP = 1000;
    const p = ((currentXP % baseXP) / baseXP) * 100;
    return {
      progress: p,
      nextLevelXP: baseXP - (currentXP % baseXP),
      isCloseToLevelUp: p > 80
    };
  }, [currentXP]);

  useEffect(() => {
    if (authLoading || !user || !token) return;

    const fetchStats = async () => {
      try {
        const data = await getUserStatistics(token, user._id);
        if (data) setStats(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Telemetry sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, user, authLoading]);

  // --- RENDERING ---

  if (loading && !stats.xp && !user) {
    return (
      <div className="w-full h-48 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/5 rounded-3xl mb-8 flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500 text-xs font-mono tracking-widest animate-pulse">SYNCHRONIZING TELEMETRY...</p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8"
    >
      {/* HEADER: LEVEL & TRAJECTORY */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              LVL {currentLevel}
            </h2>
            <div className={`px-2 py-0.5 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center gap-1.5 ${momentumStatus.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${momentumStatus.dot}`} />
              <span className="text-[9px] font-bold tracking-widest">{momentumStatus.label}</span>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
            <span className="text-gray-900 dark:text-white font-bold">{nextLevelXP} XP</span>
            <span className="opacity-60">required for next breach</span>
          </p>
        </div>

        {/* PROGRESS BAR (Dynamic Energy) */}
        <div className="w-full md:w-1/2 lg:w-5/12">
          <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">
            <span>Current Cycle</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border border-transparent dark:border-white/5 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.0, ease: "circOut" }}
              className={`h-full relative ${isCloseToLevelUp ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-white' : 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400'}`}
            >
              {/* Shimmer Effect: Faster if close to level up */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full ${isCloseToLevelUp ? 'animate-[shimmer_1s_infinite]' : 'animate-[shimmer_2.5s_infinite]'}`}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* STATS GRID (Hierarchy Applied) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatBox
          label="Total Experience"
          subLabel="Cumulative Growth"
          value={currentXP.toLocaleString()}
          icon="verified"
          theme="gold"
        />

        <StatBox
          label="Active Streak"
          subLabel="Consistency Signal"
          value={`${currentStreak} Days`}
          icon="local_fire_department"
          theme="orange"
        />

        <StatBox
          label="Network Impact"
          subLabel="Connections Made"
          value={stats.statistics?.totalMatches || 0}
          icon="hub"
          theme="blue"
        />

        <StatBox
          label="Deep Work"
          subLabel="Hours Contributed"
          value={stats.statistics?.hoursContributed || 0}
          icon="schedule"
          theme="purple"
        />

      </div>
    </motion.section>
  );
}

// --- MEMOIZED STAT COMPONENT ---
const StatBox = React.memo(({ label, subLabel, value, icon, theme }) => {

  const themes = {
    gold: "text-yellow-600 dark:text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    orange: "text-orange-600 dark:text-orange-500 bg-orange-500/10 border-orange-500/20",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20"
  };

  const style = themes[theme] || themes.blue;

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-all hover:bg-white/20 dark:hover:bg-white/5 shadow-sm dark:shadow-none bg-white/50 dark:bg-transparent ${style.split(' ').slice(1).join(' ')}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`material-symbols-outlined text-2xl ${style.split(' ')[0]}`}>{icon}</span>
      </div>
      <div>
        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">{value}</h4>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-[9px] text-gray-600 font-medium mt-0.5">{subLabel}</p>
      </div>
    </div>
  );
});