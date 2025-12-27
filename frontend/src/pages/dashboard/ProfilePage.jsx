import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import Sidebar from "../../components/dashboard/Sidebar";

export default function ProfilePage() {
  const { token } = useAuth();
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
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  };

  // 2. Button Actions
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
            method: 'PUT', // Assuming you have a PUT endpoint
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if(data.success) {
            setProfile({ ...profile, ...formData });
            setIsEditing(false);
        }
    } catch (error) {
        console.error("Update failed", error);
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
      // If the user has a GitHub username in their data, use it
      const username = profile.githubData?.username || profile.username;
      
      // Call the analysis endpoint
      const res = await fetch(`${import.meta.env.VITE_API_URL}/github/analyze/${username}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Refresh profile data to show new stats/skills
        fetchProfile(); 
        // You might want to import 'toast' and show success message
        // toast.success("GitHub data synced successfully!");
      }
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!profile) return null;

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans text-slate-200">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Toast Notification */}
        <AnimatePresence>
            {showShareToast && (
                <motion.div 
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 20 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-0 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-green-500 text-white font-bold shadow-2xl flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">check_circle</span>
                    Profile Link Copied!
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- 1. Parallax Banner --- */}
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="h-72 w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-[#030712] relative overflow-hidden"
        >
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay" />
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px]" />
             <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-[#030712] to-transparent" />
        </motion.div>

        <div className="max-w-6xl mx-auto px-6 md:px-10 relative -mt-32 pb-20">
            
            {/* --- 2. Header Section --- */}
            <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
                {/* Avatar */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-48 h-48 rounded-[2rem] bg-[#0f1629] p-1.5 border border-white/10 shadow-2xl relative group"
                >
                    <img 
                        src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&size=200`} 
                        alt="Profile" 
                        className="w-full h-full rounded-[1.7rem] object-cover bg-gray-900"
                    />
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-[1.7rem] flex items-center justify-center backdrop-blur-sm"
                    >
                        <span className="material-symbols-outlined text-white text-3xl">edit</span>
                    </button>
                </motion.div>
                
                {/* Text Info */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex-1 mb-4"
                >
                    <h1 className="text-5xl font-black text-white tracking-tight mb-2">{profile.fullName}</h1>
                    <div className="flex items-center gap-3 text-lg mb-4">
                        <span className="text-blue-400 font-mono">@{profile.username}</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-wider">
                            Level {profile.level || 1}
                        </span>
                    </div>
                    <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                        {profile.bio || "No bio yet. Tell the world who you are!"}
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-3 mb-4"
                >
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">edit_square</span>
                        Edit
                    </button>
                    <button 
                        onClick={handleShare}
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">share</span>
                        Share
                    </button>
                </motion.div>
            </div>

            {/* --- 3. Stats Grid --- */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
            >
                <StatCard label="XP Earned" value={profile.xp || 0} icon="bolt" color="text-yellow-400" delay={0.5} />
                <StatCard label="Matches" value={profile.statistics?.totalMatches || 0} icon="group" color="text-blue-400" delay={0.6} />
                <StatCard label="Completed" value={profile.statistics?.successfulMatches || 0} icon="verified" color="text-green-400" delay={0.7} />
                <StatCard label="Hours" value={Math.floor((profile.xp || 0) / 10)} icon="schedule" color="text-purple-400" delay={0.8} />
            </motion.div>

            {/* --- 4. Content Columns --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Skills */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <section className="bg-[#0f1629]/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">code_blocks</span>
                                Tech Stack
                            </h3>
                            <button className="text-xs font-bold text-blue-400 hover:text-white transition-colors">MANAGE</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                                <div key={skill._id || i} className="group flex items-center gap-4 p-3 rounded-2xl bg-black/20 border border-white/5 hover:border-blue-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-[#0B0F19] p-2 flex items-center justify-center">
                                        <img src={skill.logo} className="w-full h-full object-contain" onError={(e)=>e.target.style.display='none'}/>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-bold text-white">{skill.name}</span>
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
                                <p className="text-gray-500 italic">No skills added yet.</p>
                            )}
                        </div>
                    </section>
                </motion.div>

                {/* Right: GitHub Widget */}
                <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-6"
                >
                    <section className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <img src="https://cdn.simpleicons.org/github/white" className="w-6 h-6" />
                                GitHub Sync
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-mono text-green-400">ONLINE</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <StatRow label="Repositories" value={profile.githubData?.publicRepos || 0} />
                            <StatRow label="Followers" value={profile.githubData?.followers || 0} />
                            
                            <div className="pt-4 mt-4 border-t border-white/5">
                                <button 
                                    onClick={handleGithubSync}
                                    disabled={isSyncing}
                                    className="w-full py-3 rounded-xl bg-white/5 text-gray-300 text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className={`material-symbols-outlined text-lg ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                                    {isSyncing ? "SYNCING..." : "REFRESH DATA"}
                                </button>
                            </div>
                        </div>
                    </section>
                </motion.div>

            </div>
        </div>

        {/* --- EDIT MODAL --- */}
        <AnimatePresence>
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsEditing(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-lg bg-[#0f1629] border border-white/10 rounded-3xl p-8 shadow-2xl"
                    >
                        <h2 className="text-2xl font-black text-white mb-6">Edit Profile</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio</label>
                                <textarea 
                                    rows="4"
                                    value={formData.bio}
                                    onChange={e => setFormData({...formData, bio: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500">Save Changes</button>
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
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
    )
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-[#0f1629]/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors group">
            <div className={`w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</div>
            </div>
        </div>
    )
}

function StatRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-gray-400 font-medium text-sm">{label}</span>
            <span className="text-white font-mono font-bold">{value}</span>
        </div>
    )
}

// Helpers
const getSkillWidth = (level) => {
    switch(level) {
        case 'expert': return '100%';
        case 'advanced': return '75%';
        case 'intermediate': return '50%';
        default: return '25%';
    }
}

const getSkillColor = (level) => {
    switch(level) {
        case 'expert': return 'bg-purple-500';
        case 'advanced': return 'bg-blue-500';
        case 'intermediate': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
}