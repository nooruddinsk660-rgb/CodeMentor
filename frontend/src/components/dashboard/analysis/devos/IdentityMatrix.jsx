import React from "react";
import { motion } from "framer-motion";
import ArchetypeSensor from "./ArchetypeSensor";

export default function IdentityMatrix({ user, profile, languages, loading }) {
    // Safe defaults
    const username = profile?.username || user?.username || "UNKNOWN_ENTITY";
    const avatar = profile?.avatar || user?.avatar || "https://github.com/github.png";

    // Fix: Access nested githubData if available
    const publicRepos = profile?.githubData?.publicRepos || profile?.publicRepos || 0;
    const followers = profile?.githubData?.followers || profile?.followers || 0;
    const following = profile?.githubData?.following || profile?.following || 0;
    const bio = user?.bio || "No bio data available in neural link.";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full p-1 rounded-3xl backdrop-blur-2xl overflow-hidden"
        >
            {/* Holographic overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scanline pointer-events-none" />

            <div className="relative z-10 bg-white/80 dark:bg-[#030712]/80 rounded-[22px] p-4 flex flex-col items-center backdrop-blur-md h-full transition-colors duration-500">

                {/* AVATAR SECTION */}
                <div className="relative group">
                    {/* Rotating Rings */}
                    <div className="absolute -inset-4 rounded-full border border-cyan-500/30 border-dashed animate-[spin_10s_linear_infinite]" />
                    <div className="absolute -inset-2 rounded-full border border-purple-500/30 animate-[spin_5s_linear_infinite_reverse]" />

                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-white/20 shadow-[0_0_30px_rgba(6,182,212,0.2)] dark:shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                        <img
                            src={avatar}
                            alt={username}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0 grayscale-[20%]"
                        />
                        {/* Glitch Overlay on Hover */}
                        <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Status Dot */}
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-white dark:bg-[#030712] rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                    </div>
                </div>

                {/* INFO SECTION */}
                <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
                    <div>
                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-3 mb-1">
                            <h2 className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-cyan-600 to-cyan-500 dark:from-white dark:via-cyan-100 dark:to-cyan-400 tracking-tight drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] font-mono truncate max-w-full">
                                {username}
                            </h2>
                            {/* Verified Badge */}
                            <span className="material-symbols-outlined text-cyan-400 text-xl drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] shrink-0">
                                verified
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            <p className="text-cyan-700 dark:text-cyan-200/60 font-mono text-sm tracking-widest uppercase mb-0 flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                                // NEURAL LINK ESTABLISHED
                            </p>
                            {/* ARCHETYPE BADGE */}
                            <div className="hidden md:block">
                                {/* Check parent prop passing first, typically accessible via profile or user stats */}
                                {/* We can pass 'languages' prop to IdentityMatrix or just expect it. 
                         Let's assume we enhance IdentityMatrix to accept 'languages' prop. 
                     */}
                                <ArchetypeSensor languages={languages} />
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 font-light max-w-2xl leading-relaxed text-sm md:text-base border-l-2 border-cyan-500/30 pl-4">
                        {bio}
                    </p>

                    {/* STATS GRID */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <StatBox label="REPOS" value={publicRepos} delay={0.1} />
                        <StatBox label="FOLLOWERS" value={followers} delay={0.2} />
                        <StatBox label="FOLLOWING" value={following} delay={0.3} />
                    </div>
                </div>

                {/* DECORATIVE HUD */}
                <div className="hidden xl:block absolute top-6 right-6 font-mono text-[10px] text-cyan-500/40 text-right leading-loose">
                    <p>SYS.Ver.2.0.4</p>
                    <p>MEM: 64TB</p>
                    <p>NET: SECURE</p>
                    <div className="w-16 h-1 bg-cyan-900/50 mt-2 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-cyan-500/50 animate-pulse" />
                    </div>
                </div>

            </div>
        </motion.div>
    );
}

const StatBox = ({ label, value, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 p-3 rounded-xl backdrop-blur-sm hover:bg-white dark:hover:bg-white/10 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 group cursor-default"
        >
            <div className="text-[10px] text-gray-500 dark:text-gray-500 font-bold tracking-wider mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {label}
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white font-mono group-hover:scale-105 transition-transform origin-left">
                {value}
            </div>
        </motion.div>
    );
}
