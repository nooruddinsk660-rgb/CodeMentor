import React from "react";
import { motion } from "framer-motion";

export default function ActivityStream({ data, loading }) {
    if (loading) return null; // Controlled by parent layout usually, or we can add skeleton

    return (
        <div className="relative p-6 rounded-3xl bg-white/80 dark:bg-[#0B0F19]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 h-full overflow-hidden flex flex-col shadow-xl dark:shadow-none transition-colors duration-500">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 pointer-events-none" />

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-widest flex items-center gap-3">
                    <span className="w-2 h-8 bg-emerald-500 rounded-sm shadow-[0_0_15px_#10b981]" />
                    ACTIVITY STREAM
                </h3>
                <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500/20" />
                </div>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
                {(!data || data.length === 0) ? (
                    <div className="text-center text-gray-500 font-mono text-xs py-10">
                // SYSTEM IDLE // NO ACTIVITY LOGGED
                    </div>
                ) : (
                    data.map((repo, i) => (
                        <RepoItem key={repo.name || i} repo={repo} index={i} />
                    ))
                )}
            </div>

            {/* DECORATIVE BOTTOM GRADIENT */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-[#0B0F19] to-transparent pointer-events-none z-20" />
        </div>
    );
}

function RepoItem({ repo, index }) {
    const handleExecute = () => {
        if (repo.url) window.open(repo.url, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(16, 185, 129, 0.05)" }}
            onClick={handleExecute}
            className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 backdrop-blur-sm cursor-pointer group transition-all"
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold mb-1 opacity-70 group-hover:opacity-100">
                        GET /{repo.name}
                    </span>
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors">
                        {repo.name}
                    </h4>
                </div>
                <div className="bg-white dark:bg-white/5 px-2 py-1 rounded text-[10px] font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 group-hover:border-emerald-500/30 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                    {repo.lang || 'TXT'}
                </div>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 line-clamp-1 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                {repo.desc || "No description provided."}
            </p>

            <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    UPDATED {new Date(repo.updatedAt).toLocaleDateString()}
                </span>
                <span className="group-hover:translate-x-2 transition-transform text-emerald-500/0 group-hover:text-emerald-600 dark:group-hover:text-emerald-500/100">
                    → EXECUTE
                </span>
            </div>
        </motion.div>
    )
}
