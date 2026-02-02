import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import IdentityMatrix from '../../analysis/devos/IdentityMatrix';
// import InsightRadar from '../../analysis/devos/InsightRadar'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserProfileModal({ isOpen, onClose, userId, currentUserId, onConnect, onChat, token }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            axios.get(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setProfile(res.data.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Profile Fetch Error:", err);
                    setLoading(false);
                });
        }
    }, [isOpen, userId, token]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-4xl bg-[#0B0F19] border border-cyan-500/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col md:flex-row max-h-[85vh]"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* CLOSE BUTTON */}
                    <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 text-cyan-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    {loading ? (
                        <div className="w-full h-96 flex items-center justify-center">
                            <span className="text-cyan-500 font-mono animate-pulse">DECODING BIO-DATA...</span>
                        </div>
                    ) : profile ? (
                        <>
                            {/* LEFT COLUMN: Identity & Avatar (Using IdentityMatrix) */}
                            <div className="md:w-5/12 bg-[#050510]/80 p-0 border-r border-white/5 relative flex flex-col h-full">
                                <div className="p-4 flex-1 overflow-hidden">
                                    <IdentityMatrix
                                        user={profile}
                                        profile={profile}
                                        languages={profile.languages}
                                        loading={false}
                                    />
                                </div>

                                <div className="p-6 flex flex-col gap-3 mt-auto relative z-10 border-t border-white/5 bg-[#0B0F19]">
                                    {String(currentUserId) !== String(profile._id) && (
                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={() => {
                                                    // console.log("Connect clicked:", profile._id, profile.username);
                                                    onConnect(profile._id, profile.username || "Unknown Operator");
                                                }}
                                                className="flex-1 py-3 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-xl font-bold text-xs hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">hub</span>
                                                CONNECT
                                            </button>
                                            <button
                                                onClick={() => onChat(profile._id, profile)}
                                                className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">chat</span>
                                                CHAT
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        className="w-full py-3 border border-white/10 text-gray-500 hover:text-white rounded-xl font-mono text-[10px] tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                        onClick={() => window.open(`/user/${profile._id}`, '_blank')}
                                    >
                                        VIEW FULL PUBLIC PROFILE
                                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Stats & Data */}
                            <div className="md:w-7/12 p-8 overflow-y-auto custom-scrollbar bg-[#0B0F19]">
                                {/* SECTION 1: Skills & XP */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-wider flex items-center gap-2 group cursor-help" title="Mastered technologies and languages">
                                        <span className="material-symbols-outlined text-sm text-cyan-500">memory</span>
                                        SKILL MATRIX
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-600 font-mono lowercase ml-2"> // modules compiled</span>
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-lg bg-cyan-900/20 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
                                                {typeof skill === 'string' ? skill : skill.name}
                                            </span>
                                        )) : (
                                            <span className="text-gray-600 text-xs italic">No compiled modules found.</span>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION 2: Analytics */}
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    {/* ACTIVITY GRAPH */}
                                    <div className="bg-[#151926] rounded-2xl p-4 border border-white/5 relative group/graph transition-colors hover:border-cyan-500/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-bold text-gray-400">ACTIVITY GRAPH</h4>
                                            <span className="material-symbols-outlined text-gray-600 text-xs cursor-help hover:text-cyan-400 transition-colors" title="Visual representation of user's coding activity and quest completions over the last 20 cycles (Seeded Simulation).">help</span>
                                        </div>

                                        <div className="h-32 flex items-end gap-1 justify-between bg-black/40 rounded-lg p-2 border border-white/5">
                                            {/* Seeded Bar Chart based on User ID */}
                                            {Array.from({ length: 20 }).map((_, i) => {
                                                // Simple pseudo-random seed based on user ID chars to make it consistent per user
                                                const seed = (profile._id.charCodeAt(i % profile._id.length) || 0) + i;
                                                const height = 15 + ((seed * 17) % 85); // 15% to 100%
                                                return (
                                                    <div key={i} className="flex-1 h-full flex items-end group relative">
                                                        <div
                                                            style={{ height: `${height}%` }}
                                                            className="w-full bg-gradient-to-t from-cyan-900 to-cyan-500/50 rounded-sm group-hover:from-cyan-600 group-hover:to-cyan-400 transition-all shadow-[0_0_10px_rgba(8,145,178,0.2)]"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-2 flex justify-between text-[10px] text-gray-600 font-mono">
                                            <span>CYCLE START</span>
                                            <span>CURRENT</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="bg-[#151926] rounded-2xl p-4 border border-white/5 hover:border-yellow-500/30 transition-colors">
                                        <h4 className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2">
                                            REPUTATION
                                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-yellow-600 font-mono"> // Global Rank</span>
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
                                                <span className="material-symbols-outlined text-yellow-500">trophy</span>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">{profile.xp || 0} XP</div>
                                                <div className="text-xs text-gray-500">Total Experience Earned</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#151926] rounded-2xl p-4 border border-white/5 hover:border-purple-500/30 transition-colors">
                                        <h4 className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2">
                                            NETWORK
                                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-purple-500 font-mono"> // Uplinks</span>
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
                                                <span className="material-symbols-outlined text-purple-500">handshake</span>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">{profile.matchHistory?.length || 0}</div>
                                                <div className="text-xs text-gray-500">Connections Established</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: Recent Activity */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-wider flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">history</span>
                                        LATEST LOGS
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-default hover:bg-white/10 transition-colors">
                                            <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                                            <div>
                                                <p className="text-sm text-gray-300">Account initialized successfully.</p>
                                                <p className="text-[10px] text-gray-600 font-mono mt-1">{new Date(profile.createdAt || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {/* Dynamic Log for XP */}
                                        {profile.xp > 0 && (
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-default hover:bg-white/10 transition-colors">
                                                <span className="material-symbols-outlined text-yellow-500 text-sm mt-0.5">military_tech</span>
                                                <div>
                                                    <p className="text-sm text-gray-300">Experience gained from quests.</p>
                                                    <p className="text-[10px] text-gray-600 font-mono mt-1">ONGOING</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-96 flex flex-col items-center justify-center text-red-400">
                            <span className="material-symbols-outlined text-4xl mb-4">error</span>
                            <span className="font-mono">USER DATA CORRUPTED OR NOT FOUND</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
