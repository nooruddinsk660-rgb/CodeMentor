import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { getUserStatistics } from "../../services/userStatistics.service";
import StatsCard from "./StatsCard"; // Ensure this component exists

export default function ProgressSection() {
  const { token, user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    xp: 0,
    level: 1,
    activeStreak: 0,
    statistics: { totalMatches: 0, successfulMatches: 0, hoursContributed: 0 }
  });
  const [loading, setLoading] = useState(true);

  // Calculate Level Progress
  const calculateProgress = (xp) => {
    const baseXP = 1000; // XP needed per level
    const progress = ((xp % baseXP) / baseXP) * 100;
    const nextLevelXP = baseXP - (xp % baseXP);
    return { progress, nextLevelXP };
  };

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchStats = async () => {
      try {
        const data = await getUserStatistics(token, user._id);
        if (data) {
          setStats(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Stats sync failed - using cached/default values");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, user, authLoading]);

  const { progress, nextLevelXP } = calculateProgress(stats.xp || 0);

  if (loading && !stats.xp) {
    return (
      <div className="w-full h-48 animate-pulse bg-white/5 rounded-3xl mb-8 border border-white/5" />
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8"
    >
      {/* Header with XP Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">bolt</span>
            Level {stats.level || 1}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            <span className="text-white font-bold">{nextLevelXP} XP</span> until Level {stats.level + 1}
          </p>
        </div>
        
        {/* XP Progress Bar */}
        <div className="w-full md:w-1/2 lg:w-1/3">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 relative"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <StatBox 
          label="Total XP" 
          value={stats.xp?.toLocaleString()} 
          icon="verified" 
          color="text-yellow-400"
          bg="bg-yellow-400/10" 
          border="border-yellow-400/20"
        />

        <StatBox 
          label="Active Streak" 
          value={`${stats.activeStreak || 0} Days`} 
          icon="local_fire_department" 
          color="text-orange-500"
          bg="bg-orange-500/10"
          border="border-orange-500/20"
        />

        <StatBox 
          label="Mentorships" 
          value={stats.statistics?.totalMatches || 0} 
          icon="handshake" 
          color="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />

        <StatBox 
          label="Hours Coded" 
          value={stats.statistics?.hoursContributed || 0} 
          icon="schedule" 
          color="text-purple-400"
          bg="bg-purple-500/10"
          border="border-purple-500/20"
        />

      </div>
    </motion.section>
  );
}

// Micro-Component for Stat Box
function StatBox({ label, value, icon, color, bg, border }) {
  return (
    <div className={`p-5 rounded-2xl border ${border} ${bg} backdrop-blur-sm hover:scale-[1.02] transition-transform`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
      </div>
      <div>
        <h4 className="text-2xl font-black text-white tracking-tight">{value}</h4>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}