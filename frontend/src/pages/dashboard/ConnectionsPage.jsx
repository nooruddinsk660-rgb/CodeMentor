import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import Sidebar from "../../components/dashboard/Sidebar";

export default function ConnectionsPage() {
  const { token } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch & Hydrate Data ---
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(async (data) => {
        const history = data.data.matchHistory || [];
        const activeMatches = history.filter(m => m.status !== 'rejected');

        const hydratedMatches = await Promise.all(
            activeMatches.map(async (match) => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${match.matchedUserId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const userData = await res.json();
                    return { ...match, user: userData.data };
                } catch (e) { return null; }
            })
        );
        // Filter out nulls (failed fetches)
        setConnections(hydratedMatches.filter(Boolean));
    })
    .finally(() => setLoading(false));
  }, [token]);

  // Stats for the Header
  const pendingCount = connections.filter(c => c.status === 'pending').length;
  const activeCount = connections.filter(c => c.status === 'accepted').length;

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans text-slate-200 selection:bg-purple-500/30">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
        {/* --- Background Ambience --- */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto">
            
            {/* --- Header Dashboard --- */}
            <header className="mb-12">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2"
                >
                    Neural Network
                </motion.h1>
                <div className="flex gap-4">
                    <StatBadge label="Active Links" count={activeCount} color="bg-green-500" />
                    <StatBadge label="Pending Signals" count={pendingCount} color="bg-amber-500" />
                </div>
            </header>

            {/* --- The Grid --- */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 border-4 border-purple-500/30 border-b-purple-500 rounded-full animate-spin-reverse scale-75" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {connections.map((conn, index) => (
                            <ConnectionCard key={conn.matchedUserId || index} data={conn} index={index} />
                        ))}
                    </AnimatePresence>

                    {connections.length === 0 && (
                        <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <p className="text-gray-400">No signals detected. Initialize search protocols.</p>
                            <Link to="/find-mentor" className="mt-4 inline-block text-blue-400 hover:text-blue-300 font-bold">
                                Go to Finder &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENT: The Holographic Card ---
function ConnectionCard({ data, index }) {
    const isPending = data.status === 'pending';
    const matchPercent = Math.round((data.matchScore || 0) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative"
        >
            <Link to={`/user/${data.matchedUserId}`} className="block h-full">
                {/* Glass Container */}
                <div className="h-full bg-[#0f1629]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group-hover:border-blue-500/30 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                    {/* Top Row: Avatar & Status */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-600 p-[2px] shadow-lg">
                                <img 
                                    src={data.user?.avatar || `https://ui-avatars.com/api/?name=${data.user?.username}&background=0D8ABC&color=fff`} 
                                    className="w-full h-full rounded-xl object-cover bg-[#0B0F19]" 
                                    alt="avatar"
                                />
                            </div>
                            {/* Status Dot */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-[#0f1629] ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Synergy</div>
                            <div className={`text-xl font-black ${matchPercent > 80 ? 'text-green-400' : 'text-blue-400'}`}>
                                {matchPercent}%
                            </div>
                        </div>
                    </div>

                    {/* Middle: User Info */}
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                            {data.user?.fullName || "Unknown Developer"}
                        </h3>
                        <p className="text-sm text-slate-400 font-mono mt-1">@{data.user?.username}</p>
                        
                        {/* Skills Mini-List */}
                        <div className="flex gap-2 mt-3 overflow-hidden">
                            {data.user?.skills?.slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Bottom: Action Area */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isPending ? 'text-amber-500' : 'text-green-500'}`}>
                            {isPending ? (
                                <>
                                    <span className="material-symbols-outlined text-base">hourglass_empty</span>
                                    Pending
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-base">link</span>
                                    Connected
                                </>
                            )}
                        </div>

                        {/* "View Profile" Arrow that appears on hover */}
                        <motion.div 
                            initial={{ x: -10, opacity: 0 }}
                            whileHover={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:opacity-100 opacity-0 transition-all"
                        >
                            View Profile <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </motion.div>
                    </div>

                </div>
            </Link>
        </motion.div>
    );
}

function StatBadge({ label, count, color }) {
    return (
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <span className={`w-2 h-2 rounded-full ${color} shadow-[0_0_10px_currentColor]`} />
            <span className="text-sm text-slate-300">
                <strong className="text-white">{count}</strong> {label}
            </span>
        </div>
    );
}