import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/dashboard/Sidebar";
import DevOSBackground from "../../components/layout/DevOSBackground";
import IdentityMatrix from "../../components/dashboard/analysis/devos/IdentityMatrix";
import SkillHelix from "../../components/dashboard/analysis/devos/SkillHelix";
import ActivityStream from "../../components/dashboard/analysis/devos/ActivityStream";
import InsightRadar from "../../components/dashboard/analysis/devos/InsightRadar";
import SystemGuide from "../../components/dashboard/analysis/devos/SystemGuide";
import { useAuth } from "../../auth/AuthContext";
import { githubService } from "../../services/github.service";
import { motion } from "framer-motion";

export default function Analysis() {
  const { token, user } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  // --- 1. RESILIENT FETCH ENGINE ---
  const fetchAnalysis = useCallback(async (isRefresh = false) => {
    // Guard: If not logged in at all, stop.
    if (!user || !token) return;

    if (isRefresh) setLoading(true);

    try {
      // SMART TARGETING: Use whatever username we have. 
      // If you logged in via GitHub, user.username IS your GitHub handle.
      const targetUser = user.githubData?.username || user.username;

      // Use the new service to ANALYZE (POST) which ensures fresh data
      // This also returns the full analysis object matching our needs
      const response = await githubService.analyzeUser(targetUser, token);

      const rawData = response.data || {};

      // Transform backend response to component needs
      const cleanData = {
        languages: rawData.languageStats || {}, // Raw bytes for the card to calculate %
        recentRepos: rawData.recentRepos || [],
        profile: {
          username: rawData.profile?.username || targetUser,
          publicRepos: rawData.repositoryCount || 0,
          followers: rawData.profile?.followers || 0,
          following: rawData.profile?.following || 0,
          avatar: rawData.profile?.avatarUrl || user.avatar
        }
      };

      setAnalysisData(cleanData);

      if (isRefresh) toast.success("NEURAL SYNC COMPLETE");

    } catch (err) {
      console.error("Analysis Sync Error:", err);
      toast.error("NEURAL LINK UNSTABLE");
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Initial Load - Prioritize persisted data to be "SEAMLESS"
  useEffect(() => {
    // Check if we have ANY valid data (Stats OR Repos OR Repo Count)
    const hasStats = user?.githubData?.languageStats && Object.keys(user.githubData.languageStats).length > 0;
    const hasRepos = user?.githubData?.recentRepos && user.githubData.recentRepos.length > 0;
    const hasCount = (user?.githubData?.publicRepos || 0) > 0;

    if (hasStats || hasRepos || hasCount) {
      // We have data! Render it immediately.
      const gd = user.githubData;

      // Map DB structure to component structure
      setAnalysisData({
        languages: gd.languageStats || {},
        recentRepos: gd.recentRepos || [],
        profile: {
          username: gd.username || user.username,
          publicRepos: gd.publicRepos || 0,
          followers: gd.followers || 0,
          following: gd.following || 0,
          avatar: gd.avatarUrl || user.avatar
        }
      });
      setLoading(false);
    } else {
      // Only fetch if we have NO data
      fetchAnalysis();
    }
  }, [user, fetchAnalysis]);

  // --- 2. RENDER (DEVOS VERSION) ---
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#050510] text-gray-900 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-500">
      {/* Global DevOS Background Layer */}
      <DevOSBackground />

      {/* SYSTEM GUIDE OVERLAY */}
      <SystemGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />

      <Sidebar />

      <main className="flex-1 relative z-10 flex flex-col h-full overflow-hidden">

        {/* TOP BAR / BREADCRUMBS */}
        <div className="flex items-center justify-between px-8 py-6 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">data_exploration</span>
            <span className="text-[10px] font-mono text-cyan-500/50 tracking-[0.2em]">/ MODULES / ANALYSIS_CORE</span>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={() => setShowGuide(true)}
              className="p-2 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded-lg text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
              title="Open System Manual"
            >
              <span className="material-symbols-outlined text-sm">help</span>
            </button>
            <button
              onClick={() => fetchAnalysis(true)}
              className={`flex items-center gap-2 px-4 py-2 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded-lg text-cyan-600 dark:text-cyan-400 font-mono text-xs hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors ${loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>sync</span>
              {loading ? 'SYNCING...' : 'FORCE_SYNC'}
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-6">

            {/* 1. IDENTITY MATRIX (Full Width) */}
            <IdentityMatrix
              user={user}
              profile={analysisData?.profile}
              languages={analysisData?.languages}
              loading={loading}
            />

            {/* 2. SPLIT VIEW (Skills | Activity | Radar) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto xl:h-[500px]">

              {/* SKILL HELIX (Left - 4 cols) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="xl:col-span-4 h-full"
              >
                <SkillHelix
                  data={analysisData?.languages}
                  loading={loading}
                />
              </motion.div>

              {/* INSIGHT RADAR (Middle - 4 cols) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="xl:col-span-4 h-full"
              >
                <InsightRadar
                  profile={analysisData?.profile}
                  languages={analysisData?.languages}
                  repos={analysisData?.recentRepos}
                />
              </motion.div>

              {/* ACTIVITY STREAM (Right - 4 cols) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="xl:col-span-4 h-full"
              >
                <ActivityStream
                  data={analysisData?.recentRepos}
                  loading={loading}
                />
              </motion.div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}