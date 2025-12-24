import React, { useEffect, useState } from "react";
import StatsCard from "./StatsCard";
import { useAuth } from "../../auth/AuthContext";
import { getUserStatistics } from "../../services/userStatistics.service";
import { Zap, Trophy, Target, Loader2 } from "lucide-react"; // Import Icons

// Logic to calculate Level based on XP
const calculateLevel = (xp) => {
  const baseXP = 1000;
  const level = Math.floor(xp / baseXP) + 1;
  const nextLevelXP = level * baseXP;
  const progress = ((xp % baseXP) / baseXP) * 100;
  return { level, progress, nextLevelXP };
};

/* Futuristic Skeleton */
const SkeletonCard = () => (
  <div className="h-40 rounded-2xl bg-white/5 border border-white/5 animate-pulse overflow-hidden relative">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
  </div>
);

export default function ProgressSection() {
  const { token, user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    async function fetchStats() {
      try {
        const data = await getUserStatistics(token, user._id);
        setStats(data);
      } catch (err) {
        console.error("Statistics error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token, user, authLoading]);

  // Loading State
  if (authLoading || loading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
           <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // --- Out of the Box Logic ---
  const { level, progress } = calculateLevel(stats.xp);
  
  // Dynamic Streak Meta
  let streakColor = "blue";
  let streakMeta = "Start your journey";
  
  if (stats.activeStreak > 0) {
      streakColor = stats.activeStreak > 5 ? "orange" : "green";
      streakMeta = stats.activeStreak > 5 ? "🔥 On Fire!" : "Building Momentum";
  }

  return (
    <section className="relative overflow-hidden">
      {/* Section Header with glowing accent */}
      <div className="flex items-center gap-3 mb-8 ml-3 mt-3 relative z-10">
        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <Trophy className="text-indigo-400 w-6 h-6" />
        </div>
        <div>
            <h2 className="text-white text-2xl font-bold leading-tight">
             Dashboard Overview
            </h2>
            <p className="text-gray-400 text-sm">Real-time performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 perspective-1000">
        
        {/* Card 1: XP & Leveling */}
        <StatsCard
          label={`Level ${level} User`}
          value={stats.xp}
          meta={`${Math.round(progress)}% to Level ${level + 1}`}
          icon={Zap}
          color="purple"
          delay={0.1}
        />

        {/* Card 2: Matches */}
        <StatsCard
          label="Sessions Completed"
          value={stats.statistics.totalMatches}
          meta="Total Mentorships"
          icon={Target}
          color="blue"
          delay={0.2}
        />

        {/* Card 3: Streak */}
        <StatsCard
          label="Active Streak"
          value={stats.activeStreak}
          meta={streakMeta}
          icon={Trophy}
          color={streakColor}
          delay={0.3}
        />
        
      </div>
    </section>
  );
}