import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import confetti from "canvas-confetti";
import { apiRequest } from "../../api/client";
import { toast } from "react-hot-toast";

export default function DirectiveHero({ streak }) {
  const { user, updateUser } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 1. FETCH DIRECTIVE (System Synchronization)
  useEffect(() => {
    let mounted = true;
    const fetchBriefing = async () => {
      try {
        const res = await apiRequest("/daily/briefing");
        if (!mounted) return;

        setData(res);

        // Server Truth
        if (res?.quest?.status === 'completed') {
          setIsCompleted(true);
          return;
        }

        // Local Reconciliation (Backup Truth)
        if (user?.dailyLog?.lastQuestDate) {
          const last = new Date(user.dailyLog.lastQuestDate).toDateString();
          const today = new Date().toDateString();
          if (last === today) setIsCompleted(true);
        }
      } catch (err) {
        console.error("Directive Sync Failed:", err);
        // Silent fail is okay here, UI will show skeleton or retry
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBriefing();
    return () => { mounted = false; };
  }, [user]);

  // 2. THE DOPAMINE GOVERNOR (Rationed Rewards)
  const triggerReward = useCallback((isCritical, currentStreak) => {
    const isMilestone = currentStreak % 7 === 0;

    if (isCritical || isMilestone) {
      // FULL REWARD: For critical tasks or milestones
      const count = 200;
      const defaults = { origin: { y: 0.7 } };
      const fire = (ratio, opts) => confetti({ ...defaults, ...opts, particleCount: Math.floor(count * ratio) });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } else {
      // MICRO REWARD: Standard daily discipline
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#ffffff'] // Calm Blue/White
      });
    }
  }, []);

  const handleComplete = async () => {
    if (isCompleted || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest("/daily/quest/complete", {
        method: "POST",
        body: JSON.stringify({ xp: data?.quest?.xpReward || 100 })
      });

      if (res && res.success) {
        setIsCompleted(true);
        triggerReward(data?.quest?.priority === 'critical', res.newStreak);

        updateUser({
          ...user,
          xp: res.newXP,
          dailyLog: { ...user.dailyLog, currentStreak: res.newStreak, lastQuestDate: new Date() }
        });
        toast.success("Protocol executed.");
      } else {
        throw new Error("Validation failed");
      }
    } catch (err) {
      console.error(err);
      setError("Execution verification failed. Network packet lost.");
      toast.error("Sync failed. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) return <SkeletonLoader />;

  const { quest } = data;
  const isUrgent = quest.priority === 'critical';

  // DYNAMIC THEME ENGINE
  const theme = isUrgent
    ? { border: "border-red-200 dark:border-red-500", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", glow: "shadow-red-500/10 dark:shadow-red-900/50", button: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500" }
    : { border: "border-blue-200 dark:border-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", glow: "shadow-blue-500/10 dark:shadow-blue-900/50", button: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500" };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-full overflow-hidden rounded-[2rem] border ${theme.border} bg-white dark:bg-[#0B0F19] mb-8 group shadow-2xl ${theme.glow} transition-colors duration-500`}
    >
      {/* Background Ambience */}
      <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${isUrgent ? 'from-red-900 to-transparent' : 'from-blue-900 to-transparent'}`} />

      {/* Urgent Pulse Overlay */}
      {isUrgent && !isCompleted && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}

      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start justify-between">

        {/* LEFT COLUMN: THE DIRECTIVE */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${theme.border} ${theme.bg} ${theme.text} flex items-center gap-2`}>
              {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              {isUrgent ? "CRITICAL SYSTEM ALERT" : "PRIME DIRECTIVE"}
            </span>
            {isCompleted && (
              <motion.span
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="text-emerald-400 text-xs font-bold tracking-wider flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                LOGGED
              </motion.span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
            {isCompleted ? "Protocol Satisfied." : quest.title}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed mb-8">
            {isCompleted
              ? "System integrity restored. Neural pathways reinforced. Awaiting next cycle."
              : quest.desc}
          </p>

          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-wrap gap-4"
              >
                <button
                  onClick={() => window.open(quest.link || quest.discussion, '_blank')}
                  className="px-8 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">open_in_new</span>
                  <span className="text-sm">ACCESS RESOURCE</span>
                </button>

                <button
                  onClick={handleComplete}
                  disabled={submitting}
                  className={`px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3 text-white shadow-lg ${theme.button}`}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>VERIFYING...</span>
                    </>
                  ) : (
                    <>
                      <span>CONFIRM EXECUTION</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5"
              >
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">hourglass_empty</span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Next Directive: 14H 30M
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Feedback */}
          {error && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4">
              <p className="text-red-400 text-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                {error}
              </p>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: REWARD DATA */}
        <div className="hidden md:block text-right">
          <div className="mb-2">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Bounty Value</p>
            <p className={`text-4xl font-black ${isCompleted ? 'text-gray-400 dark:text-gray-500' : theme.text} transition-colors`}>
              +{quest.xpReward || 100} XP
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Discipline Streak</p>
            <div className="flex justify-end items-center gap-2">
              <span className={`text-2xl font-bold ${isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                {streak}
              </span>
              <span className={`material-symbols-outlined ${isCompleted ? 'text-emerald-500' : 'text-orange-500'}`}>
                {isCompleted ? 'verified' : 'local_fire_department'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function SkeletonLoader() {
  return <div className="w-full h-80 rounded-[2rem] bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/5 animate-pulse mb-8" />;
}