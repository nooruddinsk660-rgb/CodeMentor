import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import Sidebar from "../../components/dashboard/Sidebar";
import { githubService } from "../../services/github.service";
import IdentityMatrix from "../../components/dashboard/analysis/devos/IdentityMatrix";

export default function ProfilePage() {
    const { token, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showShareToast, setShowShareToast] = useState(false);

    // Form Data for Editing
    const [formData, setFormData] = useState({ fullName: "", bio: "" });

    // 1. Fetch Data
    useEffect(() => {
        fetchProfile();
    }, [token]);

    const fetchProfile = () => {
        fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setProfile(data.data);
                setFormData({
                    fullName: data.data.fullName,
                    bio: data.data.bio || ""
                });
                updateUser(data.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    // 2. Button Actions
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setProfile({ ...profile, ...formData });
                setIsEditing(false);
                toast.success("Identity updated successfully.");
            }
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update identity.");
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/user/${profile._id}`;
        navigator.clipboard.writeText(url);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
    };

    const handleGithubSync = async () => {
        setIsSyncing(true);
        try {
            const username = profile.githubData?.username || profile.username;
            const data = await githubService.analyzeUser(username, token);

            if (data.success) {
                fetchProfile();
                toast.success("Neural Link synced with GitHub.");
            }
        } catch (error) {
            console.error("Sync failed", error);
            toast.error("Neural Link connection failed.");
        } finally {
            setIsSyncing(false);
        }
    };

    if (loading) return <LoadingScreen />;
    if (!profile) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#030712] font-sans text-gray-900 dark:text-slate-200 transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                {/* Toast Notification */}
                <AnimatePresence>
                    {showShareToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 20 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-mono text-sm shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center gap-2 backdrop-blur-md"
                        >
                            <span className="material-symbols-outlined text-base">link</span>
                            UPLINK COPIED TO CLIPBOARD
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- 1. Header Section with IdentityMatrix --- */}
                <div className="relative pt-8 pb-12 px-6 md:px-10">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Left: Identity Card */}
                        <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[400px]">
                            <IdentityMatrix
                                user={profile}
                                profile={profile}
                                languages={profile.languages}
                                loading={false}
                            />
                        </div>

                        {/* Right: Actions & Quick Stats */}
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">

                            {/* Command Center Panel */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-[#0f1629]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Command Center</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your digital presence and neural links.</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-bold text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-2 group"
                                    >
                                        <span className="material-symbols-outlined text-lg text-gray-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">edit_square</span>
                                        EDIT IDENTITY
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="px-5 py-2.5 rounded-xl bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs hover:bg-cyan-600/20 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                    >
                                        <span className="material-symbols-outlined text-lg">share</span>
                                        SHARE UPLINK
                                    </button>
                                </div>
                            </motion.div>

                            {/* Stats Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                            >
                                <StatCard label="XP EARNED" value={profile.xp || 0} icon="bolt" color="text-yellow-600 dark:text-yellow-400" bgColor="bg-yellow-500/10" borderColor="border-yellow-500/20" delay={0.3} />
                                <StatCard label="MATCHES" value={profile.statistics?.totalMatches || 0} icon="group" color="text-cyan-600 dark:text-cyan-400" bgColor="bg-cyan-500/10" borderColor="border-cyan-500/20" delay={0.4} />
                                <StatCard label="PROJECTS" value={profile.statistics?.projectsCompleted || 0} icon="verified" color="text-green-600 dark:text-green-400" bgColor="bg-green-500/10" borderColor="border-green-500/20" delay={0.5} />
                                <StatCard label="HOURS" value={profile.statistics?.hoursContributed || Math.floor((profile.xp || 0) / 10)} icon="schedule" color="text-purple-600 dark:text-purple-400" bgColor="bg-purple-500/10" borderColor="border-purple-500/20" delay={0.6} />
                            </motion.div>

                            {/* GitHub Widget */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex-1 bg-gradient-to-br from-gray-900 to-black dark:from-[#161b22] dark:to-[#0d1117] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <img src="https://cdn.simpleicons.org/github/white" className="w-5 h-5" alt="GitHub" />
                                        GitHub Sync Status
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                                        <span className={`text-[10px] font-mono ${isSyncing ? 'text-yellow-400' : 'text-green-400'}`}>
                                            {isSyncing ? 'SYNCING...' : 'ACTIVE'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-4">
                                    <div>
                                        <div className="text-gray-400 text-xs font-medium mb-1">Repositories</div>
                                        <div className="text-2xl font-mono text-white">{profile.githubData?.publicRepos || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs font-medium mb-1">Followers</div>
                                        <div className="text-2xl font-mono text-white">{profile.githubData?.followers || 0}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGithubSync}
                                    disabled={isSyncing}
                                    className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-bold hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                                    {isSyncing ? "SYNCHRONIZING..." : "FORCE SYNC DATA"}
                                </button>
                            </motion.div>

                        </div>
                    </div>

                    {/* --- Content Tabs/Sections --- */}
                    <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Skill Matrix */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-[#0f1629]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden transition-colors"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-cyan-500">code_blocks</span>
                                    Tech Arsenal
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                                        <div key={skill._id || i} className="group flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 hover:border-cyan-500/30 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0B0F19] border border-gray-100 dark:border-transparent p-2 flex items-center justify-center">
                                                <img src={skill.logo} className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} alt={skill.name} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{skill.name}</span>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{skill.proficiency}</span>
                                                </div>
                                                {/* Progress Bar */}
                                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: getSkillWidth(skill.proficiency) }}
                                                        transition={{ duration: 1, delay: 0.2 }}
                                                        className={`h-full ${getSkillColor(skill.proficiency)}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-gray-500 italic text-sm">No skills modules installed.</p>
                                    )}
                                </div>
                            </motion.section>
                        </div>

                        {/* Right Column: Recent Activity (Graph) */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="bg-white dark:bg-[#0f1629]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-6 relative overflow-hidden transition-colors"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-purple-400">monitoring</span>
                                    Activity Stream
                                </h3>
                                {/* Seeded Graph */}
                                <div className="h-40 flex items-end gap-1 justify-between bg-black/40 rounded-xl p-3 border border-white/5">
                                    {Array.from({ length: 15 }).map((_, i) => {
                                        const seed = ((profile.username?.charCodeAt(0) || 0) + i) * 7;
                                        const height = 20 + (seed % 80);
                                        return (
                                            <div key={i} className="flex-1 h-full flex items-end group relative">
                                                <div
                                                    style={{ height: `${height}%` }}
                                                    className="w-full bg-gradient-to-t from-purple-900 to-purple-500/50 rounded-sm group-hover:from-purple-600 group-hover:to-purple-400 transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-3 flex justify-between text-[10px] text-gray-500 font-mono">
                                    <span>30 CYCLES AGO</span>
                                    <span>NOW</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* --- EDIT MODAL --- */}
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsEditing(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)]"
                            >
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Edit Matrix</h2>
                                <p className="text-gray-500 text-sm mb-6">Update your public facing persona.</p>

                                <form onSubmit={handleEditSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-600 dark:text-cyan-500 uppercase mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-cyan-600 dark:text-cyan-500 uppercase mb-2">Bio Data</label>
                                        <textarea
                                            rows="4"
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono text-sm leading-relaxed"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors text-xs tracking-wider">CANCEL</button>
                                        <button type="submit" className="flex-1 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20 text-xs tracking-wider">SAVE CHANGES</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}

// --- SUB COMPONENTS ---

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
    )
}

function StatCard({ label, value, icon, color, bgColor, borderColor, delay }) {
    return (
        <div className={`p-4 rounded-2xl flex flex-col justify-between ${bgColor} border ${borderColor} backdrop-blur-sm group hover:scale-[1.02] transition-transform`}>
            <div className={`flex justify-between items-start mb-2`}>
                <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
                <span className="material-symbols-outlined text-gray-400 dark:text-white/10 group-hover:text-gray-600 dark:group-hover:text-white/20">more_horiz</span>
            </div>
            <div>
                <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">{value}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{label}</div>
            </div>
        </div>
    )
}

// Helpers
const getSkillWidth = (level) => {
    switch (level) {
        case 'expert': return '100%';
        case 'advanced': return '75%';
        case 'intermediate': return '50%';
        default: return '25%';
    }
}

const getSkillColor = (level) => {
    switch (level) {
        case 'expert': return 'bg-purple-500';
        case 'advanced': return 'bg-cyan-500';
        case 'intermediate': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
}