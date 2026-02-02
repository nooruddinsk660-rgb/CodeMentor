import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SystemGuide({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/30 rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl dark:shadow-[0_0_50px_rgba(6,182,212,0.2)] relative transition-colors duration-500"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/10 p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-widest flex items-center gap-3">
                            <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400">menu_book</span>
                            SYSTEM MANUAL // V2.0
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-cyan-500 hover:text-gray-900 dark:hover:text-cyan-400"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content Grid */}
                    <div className="p-8 grid gap-8">
                        <GuideSection
                            title="01 // IDENTITY MATRIX"
                            icon="badge"
                            color="text-cyan-400"
                            desc="Your digital fingerprint. The system analyzes your repo metadata to assign a 'Developer Archetype' class (e.g., Frontend Architect). The scanning ring indicates neural sync status."
                        />

                        <GuideSection
                            title="02 // SKILL HELIX"
                            icon="dna"
                            color="text-purple-400"
                            desc="A breakdown of your linguistic DNA. Instead of boring pie charts, the helix visualizes your most used languages as raw energy bars. Hover to see exact byte counts."
                        />

                        <GuideSection
                            title="03 // INSIGHT RADAR"
                            icon="radar"
                            color="text-emerald-400"
                            desc="A 4-dimensional assessment of your coding impact: VOLUME (Output), IMPACT (Followers/Stars), DIVERSITY (Language spread), and CONSISTENCY (Push frequency)."
                        />

                        <GuideSection
                            title="04 // ACTIVITY STREAM"
                            icon="terminal"
                            color="text-rose-400"
                            desc="A live feed of your neural output. Shows the last 20 active repositories. Click any entry to 'EXECUTE' (Launch) the repository in a secure link."
                        />
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-cyan-50 dark:bg-cyan-900/10 border-t border-cyan-100 dark:border-cyan-500/20 text-center">
                        <p className="text-cyan-600/60 dark:text-cyan-500/60 font-mono text-xs">
              // END OF TRANSMISSION // CLICK ANYWHERE TO CLOSE
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function GuideSection({ title, icon, desc, color }) {
    return (
        <div className="flex gap-6 items-start group">
            <div className={`p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 ${color.replace('text-', 'text-')} group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-colors shadow-sm dark:shadow-none`}>
                <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>
            <div>
                <h3 className={`text-lg font-bold ${color} mb-2 font-mono`}>{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{desc}</p>
            </div>
        </div>
    );
}
