import React from "react";
import { motion } from "framer-motion";

const COLORS = [
    "from-yellow-400 to-orange-500", // JS
    "from-blue-400 to-cyan-500",     // TS/React
    "from-purple-400 to-pink-500",   // CSS/HTML
    "from-emerald-400 to-green-500", // Python/Backend
    "from-red-400 to-rose-500",      // Rust/C++
    "from-cyan-400 to-blue-600",
];

export default function SkillHelix({ data, loading }) {
    // Process Data
    const totalBytes = Object.values(data || {}).reduce((a, b) => a + b, 0);
    const languages = Object.entries(data || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6) // Top 6
        .map(([name, bytes], index) => ({
            name,
            bytes,
            percentage: ((bytes / totalBytes) * 100).toFixed(1),
            color: COLORS[index % COLORS.length]
        }));

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    <p className="text-cyan-500/50 font-mono text-xs animate-pulse">DECODING NEURAL PATHWAYS...</p>
                </div>
            </div>
        );
    }

    if (languages.length === 0) {
        return (
            <div className="p-8 text-center border border-gray-200 dark:border-white/5 rounded-2xl bg-gray-50 dark:bg-white/5 backdrop-blur-sm">
                <p className="text-gray-500 dark:text-gray-400 font-mono">NO LINGUISTIC PATTERNS DETECTED</p>
            </div>
        );
    }

    return (
        <div className="relative p-6 rounded-3xl bg-white/80 dark:bg-[#0B0F19]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 overflow-hidden h-full shadow-xl dark:shadow-none transition-colors duration-500">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-widest flex items-center gap-3">
                    <span className="w-2 h-8 bg-purple-500 rounded-sm shadow-[0_0_15px_#a855f7]" />
                    SKILL HELIX
                </h3>
                <span className="text-[10px] font-mono text-purple-400/60 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                    LANG.ANALYSIS.V2
                </span>
            </div>

            {/* BARS CONTAINER */}
            <div className="space-y-6 relative z-10">
                {languages.map((lang, index) => (
                    <motion.div
                        key={lang.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                    >
                        <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex items-center gap-2">
                                <span className="text-lg">{lang.name}</span>
                                {index === 0 && <span className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 px-1 rounded border border-yellow-500/30">DOMINANT</span>}
                            </span>
                            <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all cursor-default">
                                {lang.percentage}%
                            </span>
                        </div>

                        {/* TRACK */}
                        <div className="h-3 w-full bg-gray-200 dark:bg-black/50 rounded-full overflow-hidden border border-gray-100 dark:border-white/5 relative">
                            {/* LIQUID FILL */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${lang.percentage}%` }}
                                transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                                className={`h-full bg-gradient-to-r ${lang.color} relative shadow-[0_0_20px_rgba(168,85,247,0.4)]`}
                            >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* FOOTER DECO */}
            <div className="absolute bottom-4 right-4 text-[9px] text-gray-700 font-mono text-right">
                <p>TOTAL_BYTES: {totalBytes.toLocaleString()}</p>
                <p>SEGMENTS: {languages.length}</p>
            </div>
        </div>
    );
}
