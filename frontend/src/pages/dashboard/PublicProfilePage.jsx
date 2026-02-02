import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { requestConnection } from "../../services/match.service";
import Sidebar from "../../components/dashboard/Sidebar";
import IdentityMatrix from "../../components/dashboard/analysis/devos/IdentityMatrix";
import { toast } from "react-hot-toast";

export default function PublicProfilePage() {
    const { userId } = useParams();
    const { token, user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState("none");
    const [isConnecting, setIsConnecting] = useState(false);

    // --- 1. Fetch Data ---
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setProfile(data.data);
                // Check if we are already connected
                if (currentUser?.matchHistory) {
                    const match = currentUser.matchHistory.find(h => h.matchedUserId === userId);
                    if (match) setConnectionStatus(match.status);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [userId, token, currentUser]);

    // --- 2. Button Actions ---
    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await requestConnection(token, userId);
            setConnectionStatus("pending");
            toast.success("Connection uplink request transmitted.");
        } catch (err) {
            console.error("Connection failed", err);
            toast.error("Failed to transmit uplink.");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleMessage = () => {
        // Navigate to chat (placeholder)
        toast.success("Secure channel opening...");
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/find-mentor');
        }
    };

    if (loading) return <LoadingScreen />;
    if (!profile) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#030712] font-sans text-gray-900 dark:text-slate-200 transition-colors duration-500">
            <Sidebar />

            <main className="flex-1 overflow-y-auto relative custom-scrollbar">

                {/* Back Button (Fixed) */}
                <button
                    onClick={handleBack}
                    className="fixed top-6 left-24 z-50 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all group shadow-lg"
                >
                    <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
                </button>

                <div className="relative pt-20 pb-12 px-6 md:px-10 max-w-7xl mx-auto">

                    {/* --- 1. Identity Header --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                        {/* Identity Matrix */}
                        <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[400px]">
                            <IdentityMatrix
                                user={profile}
                                profile={profile}
                                languages={profile.languages}
                                loading={false}
                            />
                        </div>

                        {/* Public Actions & Bio */}
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">

                            {/* Bio Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/60 dark:bg-[#0f1629]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-lg dark:shadow-none transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-cyan-500 dark:text-cyan-400">fingerprint</span>
                                    User Dossier
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg font-light">
                                    {profile.bio || "No public bio data available in the network."}
                                </p>
                            </motion.div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <PublicStat label="XP" value={profile.xp || 0} icon="bolt" color="text-yellow-400" />
                                <PublicStat label="LEVEL" value={profile.level || 1} icon="military_tech" color="text-cyan-400" />
                                <PublicStat label="REPOS" value={profile.githubData?.publicRepos || 0} icon="code" color="text-purple-400" />
                                <PublicStat label="MATCHES" value={profile.statistics?.totalMatches || 0} icon="hub" color="text-green-400" />
                            </div>

                            {/* Connect Action Zone */}
                            <div className="flex gap-4 mt-auto">
                                {connectionStatus === "none" && (
                                    <button
                                        onClick={handleConnect}
                                        disabled={isConnecting}
                                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                                    >
                                        {isConnecting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <span className="material-symbols-outlined">person_add</span>
                                        )}
                                        INITIATE LINK
                                    </button>
                                )}
                                {connectionStatus === "pending" && (
                                    <div className="flex-1 py-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold flex items-center justify-center gap-3 cursor-default">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                        AWAITING RESPONSE
                                    </div>
                                )}
                                {connectionStatus === "accepted" && (
                                    <button
                                        onClick={handleMessage}
                                        className="flex-1 py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold hover:bg-green-500/20 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                                    >
                                        <span className="material-symbols-outlined">chat</span>
                                        SECURE CHAT
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- 2. Tech Stack Section --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="bg-white/60 dark:bg-[#0f1629]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-none"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">memory</span>
                                    Verified Modules
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                                        <SkillChip key={i} skill={skill} />
                                    )) : (
                                        <span className="text-gray-500 italic">No modules detected.</span>
                                    )}
                                </div>
                            </motion.section>
                        </div>

                        {/* Sim Activity */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="bg-white/60 dark:bg-[#0f1629]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">activity_zone</span>
                                    Signal Activity
                                </h3>
                                <div className="h-32 flex items-end gap-1 justify-between bg-black/40 rounded-xl p-2 border border-white/5">
                                    {Array.from({ length: 15 }).map((_, i) => {
                                        const seed = ((profile.username?.charCodeAt(0) || 0) + i) * 31;
                                        const height = 15 + (seed % 85);
                                        return (
                                            <div key={i} className="flex-1 h-full flex items-end">
                                                <div style={{ height: `${height}%` }} className="w-full bg-cyan-900/50 rounded-sm" />
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

// --- SUB COMPONENTS ---

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#030712] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
    );
}

function PublicStat({ label, value, icon, color }) {
    return (
        <div className="bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
            <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
            <div className="text-xl font-black text-gray-900 dark:text-white font-mono">{value}</div>
            <div className="text-[10px] text-gray-500 font-bold tracking-wider">{label}</div>
        </div>
    )
}

function SkillChip({ skill }) {
    const glowColors = {
        expert: "border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
        advanced: "border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
        intermediate: "border-green-500/30",
        beginner: "border-white/10"
    };
    const colorClass = glowColors[skill.proficiency] || glowColors.intermediate;

    return (
        <div className={`px-4 py-2 rounded-xl bg-white dark:bg-[#0B0F19] border ${colorClass} text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2 shadow-sm dark:shadow-none`}>
            <img src={skill.logo} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />
            {skill.name}
        </div>
    )
}