import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getRecommendedMatches } from "../../services/match.service";
import { useAuth } from "../../auth/AuthContext";

export default function RecentMatches() {
  const { token, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    async function fetchSignals() {
      try {
        const data = await getRecommendedMatches(token);
        setMatches(data || []);
      } catch (err) {
        console.error("Signal lost:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, [token, authLoading]);

  // 1. PERFORMANCE: Slice to top 5 only
  const topSignals = useMemo(() => matches.slice(0, 5), [matches]);

  if (loading || authLoading) return <ScanningState />;

  return (
    <div className="bg-[#0B0F19] border border-white/5 rounded-3xl p-6 h-full flex flex-col">
      
      {/* 2. HEADER WITH CONTEXT */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">history_edu</span>
            NEURAL LOGS
          </h3>
          <p className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase mt-1">
             RECENT SYNERGY DETECTION
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/5 border border-blue-500/10">
           <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
           <span className="text-[9px] font-bold text-blue-400 uppercase">Live</span>
        </div>
      </div>

      {/* 3. THE LIST */}
      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {topSignals.length > 0 ? (
           topSignals.map((match, index) => (
             <LogEntry 
                key={match.user._id} 
                data={match} 
                rank={index + 1} 
                isTop={index === 0} 
             />
           ))
        ) : (
           <EmptyState />
        )}
      </div>

    </div>
  );
}

// --- SUB-COMPONENT: The Log Entry (Memoized) ---
const LogEntry = React.memo(({ data, rank, isTop }) => {
  const navigate = useNavigate();
  const user = data.user;
  const score = Math.round((data.score || 0) * 100);

  // Fake "Time Ago" for immersion
  const timeAgo = useMemo(() => {
     const times = ['2m', '14m', '1h', '3h', '5h'];
     return times[rank - 1] || '1d';
  }, [rank]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      onClick={() => navigate(`/user/${user._id}`)}
      className={`group relative p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4
        ${isTop 
            ? 'bg-blue-900/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
        }
      `}
    >
      {/* 1. Rank Indicator */}
      <div className={`flex flex-col items-center justify-center w-8 h-8 rounded-lg border text-[10px] font-bold
         ${isTop ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent text-gray-500 border-white/10'}
      `}>
         <span>#{rank}</span>
      </div>

      {/* 2. User Info */}
      <div className="flex-1 min-w-0">
         <h4 className={`text-sm font-bold truncate ${isTop ? 'text-white' : 'text-gray-300'}`}>
            {user.fullName}
         </h4>
         <div className="flex items-center gap-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider truncate">
               {user.primarySkill || "Developer"}
            </p>
            {isTop && (
                <span className="px-1.5 py-0.5 rounded-[4px] bg-blue-500/20 text-[8px] font-bold text-blue-300 border border-blue-500/20">
                    TOP PICK
                </span>
            )}
         </div>
      </div>

      {/* 3. Metrics (Right Side) */}
      <div className="text-right">
         <div className="text-xs font-mono font-bold text-blue-400">
            {score}%
         </div>
         <div className="text-[9px] text-gray-600">
            {timeAgo}
         </div>
      </div>

    </motion.div>
  );
});

// --- STATES ---
function ScanningState() {
    return (
        <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-3">
             <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
             <span className="text-[10px] font-mono uppercase text-blue-400 animate-pulse">Synchronizing Logs...</span>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
            <span className="text-2xl opacity-30 grayscale mb-2">📡</span>
            <p className="text-gray-500 text-xs font-medium">No signals detected.</p>
            <p className="text-gray-600 text-[10px] mt-1">System is calibrating...</p>
        </div>
    )
}