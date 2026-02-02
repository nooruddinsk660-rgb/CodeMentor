import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import CountUp from 'react-countup';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CAREER_PATHS = [
    { id: 'fullstack', title: "Senior Full Stack Engineer", icon: "layers" },
    { id: 'ai_ml', title: "AI & Machine Learning Engineer", icon: "psychology" },
    { id: 'devops', title: "DevOps & Cloud Architect", icon: "cloud" },
    { id: 'blockchain', title: "Blockchain Developer", icon: "currency_bitcoin" },
    { id: 'backend', title: "Backend Systems Engineer", icon: "dns" },
    { id: 'datascientist', title: "Data Scientist", icon: "analytics" },
];

import Sidebar from '../../components/dashboard/Sidebar';

export default function CareerGalaxy() {
    const { user, token } = useAuth();
    const [selectedCareer, setSelectedCareer] = useState(CAREER_PATHS[0]);
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [gravity, setGravity] = useState(0);

    // Initial Data Fetch
    useEffect(() => {
        const initGalaxy = async () => {
            if (user && token) {
                setLoading(true);
                try {
                    // 1. Fetch Fresh User Data
                    const userRes = await axios.get(`${API_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const freshUser = userRes.data.data;
                    setUserProfile(freshUser);
                    setGravity(freshUser.gravity_index || 0);

                    // 2. Fetch Roadmap Data
                    await fetchRoadmap(selectedCareer.id);
                } catch (error) {
                    console.error("Galaxy Init Error:", error);
                    toast.error("NEURAL LINK UNSTABLE");
                } finally {
                    setLoading(false);
                }
            }
        };

        initGalaxy();
    }, [user, token, selectedCareer]);

    const fetchRoadmap = async (careerId) => {
        try {
            const res = await axios.get(`${API_URL}/roadmaps/${careerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoadmap(res.data.data);
        } catch (error) {
            console.error("Roadmap Error:", error);
            toast.error("FAILED TO LOAD MISSION DATA");
        }
    };

    const handleStartMission = async (stepId) => {
        try {
            const res = await axios.post(`${API_URL}/roadmaps/start`, {
                careerId: selectedCareer.id,
                step: stepId
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success("MISSION INITIATED", { icon: "🚀" });

            // Refresh Data to update UI state
            const userRes = await axios.get(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserProfile(userRes.data.data);
            fetchRoadmap(selectedCareer.id);

        } catch (error) {
            toast.error(error.response?.data?.error || "Mission Start Failed");
        }
    };

    const handleCompleteMission = async (stepId) => {
        try {
            const res = await axios.post(`${API_URL}/roadmaps/complete`, {
                careerId: selectedCareer.id,
                step: stepId
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success(`MISSION COMPLETE! +${res.data.mission.xp_earned} G`, { icon: "🏆" });

            // Animate Gravity Update
            setGravity(res.data.gravity_index);

            // Refresh Data
            const userRes = await axios.get(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserProfile(userRes.data.data);
            fetchRoadmap(selectedCareer.id);

        } catch (error) {
            toast.error("Completion Failed");
        }
    };


    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white overflow-hidden font-sans transition-colors duration-500">
            <Sidebar />

            <main className="flex-1 relative flex flex-col h-full isolate">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-purple-500/10 dark:bg-purple-900/20 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-[50vh] h-[50vh] bg-blue-500/10 dark:bg-blue-900/20 blur-[100px]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20" />
                </div>

                {/* Header */}
                <div className="flex-none p-6 z-10 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md flex justify-between items-center transition-colors">
                    <div>
                        <h1 className="text-2xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                            CAREER GALAXY
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-slate-500 font-mono mt-1">
                            {selectedCareer.title.toUpperCase()} // MISSION CONTROL
                        </p>
                    </div>

                    {/* Gravity Indicator */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 dark:text-slate-400 font-mono uppercase">Gravity Index</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-700 dark:from-yellow-400 dark:to-amber-600">
                                <CountUp end={gravity} duration={2} separator="," /> G
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-white/10 flex items-center justify-center relative bg-white dark:bg-white/5">
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="material-symbols-outlined text-purple-400">rocket_launch</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex z-10">
                    {/* Sidebar: Role Selector */}
                    <div className="w-72 border-r border-gray-200 dark:border-white/10 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-black/20 p-4 flex flex-col gap-2 transition-colors">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest mb-2 px-2">Select Trajectory</h3>
                        {CAREER_PATHS.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedCareer(role)}
                                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedCareer.id === role.id
                                    ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-500/50 shadow-md dark:shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                    : 'bg-white dark:bg-white/5 text-gray-600 dark:text-slate-400 border border-transparent hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{role.icon}</span>
                                <span className="text-sm font-medium">{role.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Dashboard Area - Graph View */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative flex justify-center">
                        {loading || !roadmap ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-purple-400 opacity-80">
                                <span className="material-symbols-outlined text-4xl animate-spin">cyclone</span>
                                <span className="font-mono text-sm animate-pulse">CALCULATING TRAJECTORY...</span>
                            </div>
                        ) : (
                            <div className="max-w-3xl w-full relative py-10">
                                {/* Vertical Connecting Line */}
                                <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-purple-500/50 via-blue-500/30 to-transparent" />

                                <div className="space-y-12">
                                    {roadmap.missions.map((mission, i) => (
                                        <div key={mission.step} className="relative pl-20 group">
                                            {/* Step Indicator / Node */}
                                            <div className={`absolute left-0 top-6 w-20 flex items-center justify-center`}>
                                                {/* Connecting Horizontal Line */}
                                                <div className={`absolute right-0 top-1/2 w-8 h-0.5 ${mission.status !== 'locked' ? 'bg-purple-500' : 'bg-gray-300 dark:bg-white/10'}`} />

                                                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center z-10 shadow-xl transition-all duration-500 bg-white dark:bg-black
                                                    ${mission.status === 'completed' ? 'border-yellow-500 shadow-yellow-500/20' :
                                                        mission.status === 'active' ? 'border-green-500 shadow-green-500/30 scale-110' :
                                                            mission.status === 'locked' ? 'border-gray-200 dark:border-slate-700 opacity-50' : 'border-purple-500 shadow-purple-500/20 hover:scale-105'}
                                                `}>
                                                    {mission.status === 'completed' ? (
                                                        <span className="material-symbols-outlined text-3xl text-yellow-500">emoji_events</span>
                                                    ) : (
                                                        <span className={`text-2xl font-bold font-mono ${mission.status === 'locked' ? 'text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-white'}`}>
                                                            {mission.step}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mission Card */}
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-300
                                                    ${mission.status === 'locked' ? 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5 grayscale opacity-60' :
                                                        mission.status === 'active' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]' :
                                                            mission.status === 'completed' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-500/30' :
                                                                'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-purple-500/50 shadow-sm'}
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className={`text-lg font-bold ${mission.status === 'completed' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                                                                {mission.label}
                                                            </h3>
                                                            {mission.status === 'active' && (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500 text-black animate-pulse">
                                                                    ACTIVE
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 dark:text-slate-400 text-sm">{mission.description}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-slate-500 font-mono mb-1">REWARD</div>
                                                        <div className="text-sm font-bold text-yellow-400">+{mission.xp_reward || 100} G</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {mission.topics.map(topic => (
                                                        <span key={topic} className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/5">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-white/5">
                                                    <div className="text-xs text-gray-500 dark:text-slate-500 font-mono">
                                                        DIFFICULTY: {Array(mission.difficulty).fill('★').join('')}
                                                    </div>

                                                    {mission.status === 'locked' ? (
                                                        <button disabled className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 text-sm font-bold cursor-not-allowed flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-sm">lock</span>
                                                            LOCKED
                                                        </button>
                                                    ) : mission.status === 'active' ? (
                                                        <div className="flex gap-2">
                                                            <button className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-bold cursor-default flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-sm">sync</span>
                                                                IN PROGRESS
                                                            </button>
                                                            <button
                                                                onClick={() => handleCompleteMission(mission.step)}
                                                                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                                COMPLETE
                                                            </button>
                                                        </div>
                                                    ) : mission.status === 'completed' ? (
                                                        <button disabled className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-bold cursor-default flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-sm">emoji_events</span>
                                                            COMPLETED
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStartMission(mission.step)}
                                                            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all shadow-lg shadow-purple-900/20 active:scale-95 flex items-center gap-2 group-hover:scale-105"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                                            START MISSION
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
