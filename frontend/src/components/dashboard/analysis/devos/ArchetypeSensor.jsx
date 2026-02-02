import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function ArchetypeSensor({ languages }) {
    const archetype = useMemo(() => {
        if (!languages || Object.keys(languages).length === 0) return { title: "NEURAL INITIATE", color: "text-gray-400" };

        const total = Object.values(languages).reduce((a, b) => a + b, 0);
        const getPct = (lang) => ((languages[lang] || 0) / total) * 100;

        // Classification Logic
        const js = getPct("JavaScript") + getPct("TypeScript") + getPct("HTML") + getPct("CSS");
        const py = getPct("Python") + getPct("Jupyter Notebook");
        const backend = getPct("Java") + getPct("Go") + getPct("Rust") + getPct("C++") + getPct("C#");

        if (js > 60) return { title: "FRONTEND ARCHITECT", color: "text-cyan-400", icon: "html" };
        if (py > 50) return { title: "DATA SCIENTIST", color: "text-emerald-400", icon: "dataset" };
        if (backend > 50) return { title: "SYSTEMS ENGINEER", color: "text-purple-400", icon: "memory" };
        if (js > 30 && backend > 30) return { title: "FULL-STACK POLYMATH", color: "text-rose-400", icon: "layers" };

        return { title: "CODE GENERALIST", color: "text-blue-400", icon: "code" };
    }, [languages]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        >
            <div className={`p-1.5 rounded-full bg-white/5 border border-white/10 ${archetype.color}`}>
                <span className="material-symbols-outlined text-lg">{archetype.icon || 'fingerprint'}</span>
            </div>
            <div>
                <p className="text-[9px] text-gray-500 font-mono tracking-widest leading-none mb-0.5">ARCHETYPE DETECTED</p>
                <p className={`font-black font-mono text-sm tracking-wider ${archetype.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]`}>
                    {archetype.title}
                </p>
            </div>
        </motion.div>
    );
}
