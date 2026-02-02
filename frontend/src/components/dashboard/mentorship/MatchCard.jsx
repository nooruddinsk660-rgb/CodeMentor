import React from 'react';
import { motion } from 'framer-motion';

export default function MatchCard({ match, connectedIds, index, onConnect, onViewProfile }) {
    // Safe fallback for username and full name
    const displayName = match.fullName || match.username || "Unknown Entity";
    const username = match.username || "user";
    const avatar = match.avatar || 'https://github.com/github.png';
    const isConnected = connectedIds.has(match._id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className={`group relative w-full h-full bg-white dark:bg-[#0B0F19] border ${isConnected ? 'border-green-200 dark:border-green-500/30' : 'border-gray-200 dark:border-white/10 hover:border-cyan-400 dark:hover:border-cyan-500/50'} rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col`}
        >
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-10 pointer-events-none mix-blend-overlay" />
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${isConnected ? 'to-green-500/5 dark:to-green-900/10' : 'to-cyan-500/5 dark:to-cyan-900/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            {/* HEADER: Avatar & Badges */}
            <div className="p-5 flex items-start justify-between relative z-10">
                <div
                    className="relative cursor-pointer group/avatar"
                    onClick={() => onViewProfile(match._id)}
                >
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group-hover/avatar:border-cyan-400/50 transition-colors shadow-md dark:shadow-lg">
                        <img
                            src={avatar}
                            alt={username}
                            className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                        />
                    </div>
                    {/* Status Dot */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-[#0B0F19] rounded-full flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'} animate-pulse`} />
                    </div>
                </div>

                {/* Match Score */}
                {match.matchScore > 0 && (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono tracking-wider">SYNC RATE</span>
                        <div className={`text-lg font-bold font-mono ${match.matchScore > 80 ? 'text-green-600 dark:text-green-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                            {match.matchScore}%
                        </div>
                    </div>
                )}
            </div>

            {/* BODY: Info & Skills */}
            <div className="px-5 pb-5 flex-1 flex flex-col relative z-10">
                <div onClick={() => onViewProfile(match._id)} className="cursor-pointer mb-3">
                    <h3 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {displayName}
                    </h3>
                    <p className="text-cyan-600/80 dark:text-cyan-500/60 text-xs font-mono tracking-widest uppercase">
                        @{username} // LVL {match.level || 1}
                    </p>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-2 h-9 mb-4 font-light border-l-2 border-gray-200 dark:border-white/5 pl-3 group-hover:border-cyan-500/30 transition-colors">
                    {match.bio || "System bio: No data available."}
                </p>

                {/* Skills - Pill Design */}
                <div className="flex flex-wrap gap-1.5 mb-6 content-start max-h-[60px] overflow-hidden mask-fade-bottom">
                    {(match.skills || []).slice(0, 4).map((skill, i) => (
                        <span
                            key={i}
                            className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-[10px] text-gray-700 dark:text-gray-300 font-mono group-hover:border-cyan-500/20 group-hover:bg-cyan-500/5 transition-colors"
                        >
                            {typeof skill === 'string' ? skill : skill.name}
                        </span>
                    ))}
                    {(match.skills?.length > 4) && (
                        <span className="px-2 py-1 rounded-md bg-transparent border border-gray-200 dark:border-white/5 text-[10px] text-gray-500 font-mono">
                            +{match.skills.length - 4}
                        </span>
                    )}
                </div>

                {/* ACTION BUTTON */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onConnect(match._id, match.username || username);
                    }}
                    disabled={isConnected}
                    className={`mt-auto w-full py-3 rounded-lg border font-bold text-[10px] tracking-[0.15em] transition-all flex items-center justify-center gap-2 group/btn ${isConnected
                        ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 cursor-default'
                        : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-cyan-600 hover:border-cyan-500 hover:text-white active:scale-95'
                        }`}
                >
                    <span className={`material-symbols-outlined text-base transition-transform group-hover/btn:scale-110 ${isConnected ? '' : ''}`}>
                        {isConnected ? 'check_circle' : 'person_add'}
                    </span>
                    {isConnected ? 'LINKED' : 'CONNECT'}
                </button>
            </div>
        </motion.div>
    );
}

// Add CSS helper for fading out skills if too many
const styles = `
.mask-fade-bottom {
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}
`;
