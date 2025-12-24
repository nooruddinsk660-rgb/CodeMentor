import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 
import { useAuth } from "../../auth/AuthContext";
import { requestConnection } from "../../services/match.service";
import Sidebar from "../../components/dashboard/Sidebar";

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
    } catch (err) {
        console.error("Connection failed", err);
    } finally {
        setIsConnecting(false);
    }
  };

  const handleMessage = () => {
    // 1. Create a chat room (Mock or Real API call)
    // 2. Navigate to chat
    console.log("Navigating to chat with:", profile.fullName);
    
    // If you have a chat route, uncomment this:
    // navigate(`/dashboard/messages?user=${userId}`);
    
    // For now, alert to show it works
    alert(`Starting secure chat with ${profile.fullName}...`);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
        navigate(-1);
    } else {
        navigate('/find-mentor'); // Fallback if opened directly
    }
  };

  if (loading) return <LoadingScreen />;
  if (!profile) return null;

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans text-slate-200">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative">
        
        {/* --- 1. Parallax Banner --- */}
        <div className="h-80 w-full relative overflow-hidden">
             {/* Animated Gradient Background */}
             <div className="absolute inset-0 bg-gradient-to-r from-violet-900 via-blue-900 to-black animate-gradient-xy" />
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
             
             {/* Decorative Orbs */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}
                className="absolute top-[-50%] left-[20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" 
             />
             <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, delay: 0.2 }}
                className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px]" 
             />

             {/* Back Button */}
             <button 
                onClick={handleBack}
                className="absolute top-8 left-8 p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all z-20 group shadow-lg"
             >
                <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
             </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-10 relative -mt-32 pb-20">
            
            {/* --- 2. Floating Header Card --- */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col md:flex-row items-end gap-8 mb-12"
            >
                {/* Avatar with Glow */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[35px] blur opacity-75 group-hover:opacity-100 transition duration-500" />
                    <div className="relative w-48 h-48 rounded-[32px] bg-[#0f1629] p-1.5 shadow-2xl">
                        <img 
                            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&size=200`} 
                            alt="Profile" 
                            className="w-full h-full rounded-[28px] object-cover bg-gray-900"
                        />
                    </div>
                </div>
                
                <div className="flex-1 mb-4">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg"
                    >
                        {profile.fullName}
                    </motion.h1>
                    
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="flex items-center gap-4 text-lg"
                    >
                        <span className="text-blue-300 font-mono font-medium">@{profile.username}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-300 uppercase tracking-wider">
                            Level {profile.level || 1} Developer
                        </span>
                    </motion.div>
                </div>

                {/* --- 3. Interactive Connect Button --- */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                    className="mb-6"
                >
                    {connectionStatus === "none" && (
                        <button 
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isConnecting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined">person_add</span>
                            )}
                            Connect Now
                        </button>
                    )}
                    {connectionStatus === "pending" && (
                        <div className="px-8 py-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-3 cursor-default">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Request Sent
                        </div>
                    )}
                    {connectionStatus === "accepted" && (
                        <button 
                            onClick={handleMessage}
                            className="px-8 py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-500 transition-all shadow-lg flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined">chat</span>
                            Send Message
                        </button>
                    )}
                </motion.div>
            </motion.div>

            {/* --- 4. Content Grid (Staggered Flow) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Bio & Tech Stack */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio Section */}
                    <motion.section 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-[#0f1629]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400">fingerprint</span>
                            About
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {profile.bio || "This developer prefers to let their code speak for itself."}
                        </p>
                    </motion.section>

                    {/* Tech Stack Section */}
                    <motion.section 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 px-2">
                            <span className="material-symbols-outlined text-purple-400">memory</span>
                            Tech Arsenal
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {profile.skills?.map((skill, i) => (
                                <SkillChip key={skill._id || i} skill={skill} index={i} />
                            ))}
                        </div>
                    </motion.section>
                </div>

                {/* Right Column: Stats & Github */}
                <div className="space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="bg-[#0f1629]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6"
                    >
                        <StatRow label="Total XP" value={profile.xp || 0} icon="bolt" color="text-yellow-400" />
                        <StatRow label="Matches" value={profile.statistics?.totalMatches || 0} icon="group" color="text-blue-400" />
                        <div className="h-px bg-white/10 my-4" />
                        <StatRow label="Repositories" value={profile.githubData?.publicRepos || 0} icon="code_blocks" color="text-white" />
                        
                        <a 
                            href={`https://github.com/${profile.username}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        >
                            View on GitHub <span className="material-symbols-outlined text-base">open_in_new</span>
                        </a>
                    </motion.div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );
}

function SkillChip({ skill, index }) {
    const glowColors = {
        expert: "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
        advanced: "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
        intermediate: "border-white/10",
        beginner: "border-white/5 opacity-80"
    };

    const colorClass = glowColors[skill.proficiency] || glowColors.intermediate;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + (index * 0.05) }}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0B0F19] border ${colorClass} hover:scale-105 transition-transform cursor-default`}
        >
            <img src={skill.logo} className="w-6 h-6 object-contain" onError={(e) => e.target.style.display='none'} />
            <div className="flex flex-col">
                <span className="text-white text-sm font-bold tracking-wide">{skill.name}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">{skill.proficiency}</span>
            </div>
        </motion.div>
    )
}

function StatRow({ label, value, icon, color }) {
    return (
        <div className="flex justify-between items-center group">
            <div className="flex items-center gap-3 text-gray-400">
                <span className={`material-symbols-outlined ${color} group-hover:scale-110 transition-transform`}>{icon}</span>
                <span className="font-medium text-sm">{label}</span>
            </div>
            <span className="text-2xl font-black text-white font-mono tracking-tight">{value}</span>
        </div>
    )
}