import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function GitHubSyncButton() {
  const { token, user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Smart Label Logic
  const isGithubAuth = !!user?.githubId; // Did they login via GitHub?

  const handleSync = async () => {
    setSyncing(true);
    // If we are refreshing data, we use a different message than "connecting"
    const toastId = toast.loading(isGithubAuth ? "Updating neural vectors..." : "Establishing connection...");

    try {
      // 1. Target Identification
      const targetUser = user?.githubData?.username || user?.username;

      if (!targetUser) {
        throw new Error("Identity signature missing.");
      }

      // 2. Trigger Analysis
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/github/analyze/${targetUser}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error("Data stream interrupted.");

      // 3. Success
      setLastSync(new Date());
      toast.success("Intelligence updated successfully.", { id: toastId });

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Sync failed", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">

      {/* 1. THE CONTROL SURFACE */}
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSync}
        disabled={syncing}
        className={`
          group relative pl-4 pr-6 py-3 rounded-xl 
          bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 
          text-sm font-bold text-gray-600 dark:text-gray-300 
          hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-3 transition-all shadow-sm dark:shadow-lg hover:shadow-md
        `}
      >
        {/* Icon / Spinner */}
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
          {syncing ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[18px] opacity-70 group-hover:opacity-100">
              refresh
            </span>
          )}
        </div>

        <div className="text-left">
          <span className="block text-xs font-bold tracking-wide uppercase text-gray-900 dark:text-gray-100">
            {syncing ? "ANALYZING..." : "REFRESH INTELLIGENCE"}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {isGithubAuth ? "Pull latest commit data" : "Sync external repo data"}
          </span>
        </div>

        {/* Status Dot */}
        <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full transition-colors ${syncing ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500/50'}`} />
      </motion.button>

      {/* 2. CONTEXTUAL FEEDBACK */}
      <div className="pl-1">
        {lastSync ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-emerald-400/80 font-mono tracking-wide flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            SYSTEM UP-TO-DATE
          </motion.p>
        ) : (
          <p className="text-[10px] text-gray-500 dark:text-gray-600 font-mono tracking-wide flex items-center gap-1.5 opacity-60">
            <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />
            AUTO-SYNC: OFF (MANUAL TRIGGER)
          </p>
        )}
      </div>
    </div>
  );
}