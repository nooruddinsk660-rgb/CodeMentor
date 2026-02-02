import React, { useState, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

export default function GravityField({ skills, driftWarnings = [], onSkillSelect }) {
    const containerRef = useRef(null);
    const [hoveredSkill, setHoveredSkill] = useState(null);

    // --- 1. 3D PARALLAX (Damped for Stability) ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 60, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 60, damping: 20 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };
    const handleMouseLeave = () => { x.set(0); y.set(0); };

    // --- 2. DATA SEMANTICS ---
    const validSkills = useMemo(() => {
        return (skills || [])
            .map(s => {
                let score = Number(s.gravityScore) || 0;
                if (score === 0) {
                    const weights = { beginner: 0.2, intermediate: 0.5, advanced: 0.8, expert: 1.0 };
                    score = weights[(s.proficiency || 'beginner').toLowerCase()] || 0.2;
                }
                return { ...s, gravityScore: score, level: s.proficiency || 'beginner' };
            })
            .sort((a, b) => b.gravityScore - a.gravityScore)
            .slice(0, 8); // Strict limit for hierarchy
    }, [skills]);

    if (validSkills.length === 0) return <EmptyGravityState />;

    // --- 3. MASTERPIECE THEME ENGINE ---
    const getTheme = (level, isDecaying) => {
        if (isDecaying) return {
            gradient: "bg-gradient-to-b from-red-600 to-rose-900",
            shadow: "shadow-[0_0_20px_rgba(244,63,94,0.4)]",
            border: "border-red-400/40"
        };
        switch (level.toLowerCase()) {
            case 'expert': return {
                gradient: "bg-gradient-to-b from-amber-300 via-orange-500 to-amber-700",
                shadow: "shadow-[0_0_25px_rgba(251,191,36,0.3)]",
                border: "border-amber-200/40"
            };
            case 'advanced': return {
                gradient: "bg-gradient-to-b from-cyan-300 via-blue-500 to-indigo-600",
                shadow: "shadow-[0_0_25px_rgba(34,211,238,0.3)]",
                border: "border-cyan-200/40"
            };
            case 'intermediate': return {
                gradient: "bg-gradient-to-b from-teal-300 via-emerald-500 to-green-800",
                shadow: "shadow-[0_0_20px_rgba(52,211,153,0.3)]",
                border: "border-emerald-200/30"
            };
            default: return {
                gradient: "bg-gradient-to-b from-fuchsia-300 via-purple-500 to-violet-800",
                shadow: "shadow-[0_0_20px_rgba(216,180,254,0.3)]",
                border: "border-purple-200/30"
            };
        }
    };

    // Semantic Sizing: 40px (Novice) -> 75px (Expert)
    const getSize = (score) => 40 + (score * 35);

    return (
        <div style={{ perspective: 1000 }} className="w-full h-[650px] flex items-center justify-center py-8">

            <motion.div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-full h-full max-w-5xl rounded-[3rem] bg-gray-50 dark:bg-[#030712] border border-gray-200 dark:border-white/5 shadow-2xl dark:shadow-2xl overflow-hidden group/plate cursor-crosshair"
            >
                {/* A. ATMOSPHERE (Reduced Noise for Clarity) */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-100 via-gray-50 to-white dark:from-[#0f172a] dark:via-[#030712] dark:to-black opacity-90 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.08] mix-blend-multiply dark:mix-blend-overlay pointer-events-none" />

                {/* B. HUD HEADER (Minimalist) */}
                <div style={{ transform: "translateZ(30px)" }} className="absolute top-10 left-10 z-30 pointer-events-none mix-blend-difference">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-gray-900 dark:text-white font-black text-3xl tracking-tighter leading-none opacity-80">
                            GRAVITY<span className="text-gray-400 dark:text-gray-500">.SYS</span>
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <p className="text-[9px] text-gray-500 dark:text-gray-500 font-mono tracking-[0.2em] uppercase">
                                {validSkills.length} NODES STABILIZED
                            </p>
                        </div>
                    </div>
                </div>

                {/* C. THE UNIVERSE */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "translateZ(20px)" }}>

                    {/* 1. THE SINGULARITY (Restrained) */}
                    <div className="absolute z-0 w-32 h-32 flex items-center justify-center pointer-events-none">
                        <div className="absolute inset-[-40px] rounded-full bg-blue-200/20 dark:bg-blue-900/10 blur-[60px]" />
                        <div className="absolute inset-[-15px] rounded-full border border-gray-300 dark:border-white/10 border-dashed animate-[spin_40s_linear_infinite]" />
                        <div className="relative w-full h-full rounded-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-[0_0_40px_rgba(56,189,248,0.1)] flex items-center justify-center overflow-hidden">
                            <div className="w-12 h-0.5 bg-black/10 dark:bg-white/20 blur-sm rotate-45 absolute" />
                            <div className="w-12 h-0.5 bg-black/10 dark:bg-white/20 blur-sm -rotate-45 absolute" />
                            <div className="w-3 h-3 bg-gray-900 dark:bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] dark:shadow-[0_0_15px_white] z-10" />
                        </div>
                    </div>

                    {/* 2. SEMANTIC ORBITS */}
                    {validSkills.map((skill, i) => {
                        // --- SEMANTIC LOGIC ---
                        // High Gravity = Closer Orbit (Physics!)
                        const orbitRadius = 140 + (i * 25);
                        // High Mass = Slower Orbit (Physics!)
                        const duration = 120 + (skill.gravityScore * 60);

                        const initialRotation = (i * 360) / validSkills.length;
                        const size = getSize(skill.gravityScore);
                        const theme = getTheme(skill.level, skill.gravityScore < 0.3);

                        return (
                            <motion.div
                                key={skill.name}
                                // THE ORBIT RING
                                style={{
                                    position: "absolute",
                                    top: "50%", left: "50%", x: "-50%", y: "-50%",
                                    width: orbitRadius * 2, height: orbitRadius * 2,
                                    pointerEvents: "none", zIndex: 10,
                                    willChange: "transform"
                                }}
                                initial={{ rotate: initialRotation }}
                                animate={{ rotate: initialRotation + 360 }}
                                transition={{ duration: duration, ease: "linear", repeat: Infinity }}
                            >
                                {/* Subtle Orbit Path */}
                                <div className="absolute inset-0 rounded-full border border-gray-900/5 dark:border-white/5 opacity-50 pointer-events-none" />

                                {/* THE PLANET */}
                                <motion.div
                                    style={{
                                        position: "absolute",
                                        top: -size / 2, left: "50%", x: "-50%",
                                        width: size, height: size,
                                        pointerEvents: "auto", cursor: "grab"
                                    }}
                                    initial={{ rotate: -initialRotation }}
                                    animate={{ rotate: -(initialRotation + 360) }}
                                    transition={{ duration: duration, ease: "linear", repeat: Infinity }}

                                    whileHover={{ scale: 1.2, zIndex: 100 }}
                                    whileTap={{ cursor: "grabbing" }}

                                    // PHYSICS RECLAIM: Drag breaks orbit, release snaps back
                                    drag
                                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                    dragElastic={0.15} // Heavy feeling
                                    dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }} // Snappy return

                                    onHoverStart={() => setHoveredSkill(skill)}
                                    onHoverEnd={() => setHoveredSkill(null)}
                                    onClick={() => onSkillSelect && onSkillSelect(skill)}
                                >
                                    {/* PLANET VISUALS */}
                                    <div className={`relative w-full h-full rounded-full ${theme.gradient} ${theme.border} border flex items-center justify-center group shadow-xl transition-all duration-500`}>

                                        {/* 3D Shine */}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />

                                        {/* Hover Glow */}
                                        <div className={`absolute -inset-4 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl ${theme.gradient}`} />

                                        {/* Expert Ring (Only for top tier) */}
                                        {skill.level === 'expert' && (
                                            <div className="absolute -inset-1.5 rounded-full border border-white/20 border-dashed animate-[spin_12s_linear_infinite]" />
                                        )}

                                        {/* Label */}
                                        <span className="relative z-10 block text-[9px] font-black text-white/90 uppercase tracking-tighter truncate max-w-[90%] mx-auto drop-shadow-md mix-blend-overlay">
                                            {skill.name}
                                        </span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* D. DATA TOOLTIP (Minimalist & Trustworthy) */}
                <AnimatePresence>
                    {hoveredSkill && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                            style={{ transform: "translateZ(60px)" }}
                            className="absolute bottom-8 right-8 z-50 pointer-events-none"
                        >
                            <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-2xl min-w-[220px]">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{hoveredSkill.name}</h4>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getTheme(hoveredSkill.level).gradient} text-white`}>
                                        {hoveredSkill.level}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase">
                                        <span>Orbit Stability</span>
                                        <span>{Math.round(hoveredSkill.gravityScore * 100)}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${hoveredSkill.gravityScore * 100}%` }}
                                            transition={{ duration: 0.5, ease: "circOut" }}
                                            className={`h-full ${getTheme(hoveredSkill.level).gradient}`}
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-500 dark:text-gray-600 mt-2 italic">
                                        * Gravity derived from usage & proficiency
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
}

function EmptyGravityState() {
    return <div className="h-[650px] flex items-center justify-center text-gray-400 dark:text-gray-600 font-mono tracking-widest uppercase text-sm">System Void // Initialize Skills</div>;
}