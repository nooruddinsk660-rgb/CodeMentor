import React, { useMemo, useId } from "react";
import { motion } from "framer-motion";

export default function TrajectoryCard({ data = [], intelligence }) {
    const gradientId = useId();

    // --- 1. SEMANTIC ENGINE (The Voice) ---
    const { hasData, velocityScore, semantics } = useMemo(() => {
        const hasData = intelligence && intelligence.status === 'success';
        const velocityScore = hasData ? Math.round(intelligence.gravity_index * 100) : 0;

        let headline = "System Calibrating...";
        let subStatus = "Initializing";
        let trendIcon = "hourglass_empty";
        let trendColor = "text-gray-500";

        if (hasData) {
            if (intelligence.trajectory === 'accelerating') {
                headline = "Momentum Shift Detected";
                subStatus = "Positive Signal";
                trendIcon = "trending_up";
                trendColor = "text-emerald-400";
            } else if (intelligence.trajectory === 'decelerating') {
                headline = "Pace Stabilizing";
                subStatus = "Signal Cooling";
                trendIcon = "trending_down";
                trendColor = "text-orange-400";
            } else {
                headline = "Rhythm Consistent";
                subStatus = "Signal Stable";
                trendIcon = "trending_flat";
                trendColor = "text-blue-400";
            }
        }

        return {
            hasData,
            velocityScore,
            semantics: { headline, subStatus, trendIcon, trendColor }
        };
    }, [intelligence]);

    // --- 2. CHART MATH ---
    const normalizedData = useMemo(() => {
        if (!data || data.length === 0) return Array(30).fill(0);
        const max = Math.max(...data, 1);
        return data.map(d => d / max);
    }, [data]);

    const pathD = useMemo(() => {
        const width = 100; const height = 40; const step = width / (normalizedData.length - 1);
        const points = normalizedData.map((d, i) => `${i * step},${height - (d * height)}`);

        let d = `M ${points[0]}`;
        for (let i = 1; i < points.length; i++) {
            const [currX, currY] = points[i].split(',');
            const [prevX, prevY] = points[i - 1].split(',');
            d += ` C ${parseFloat(prevX) + step / 2},${parseFloat(prevY)} ${parseFloat(currX) - step / 2},${parseFloat(currY)} ${currX},${currY}`;
        }
        return d;
    }, [normalizedData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-6 md:p-8 rounded-[32px] bg-white dark:bg-[#0B0F19] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden group flex flex-col justify-between h-full bg-gradient-to-b from-white to-gray-50 dark:from-[#0B0F19] dark:to-[#050912]"
        >
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-200/20 dark:bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* --- TOP: INTELLIGENCE LAYER --- */}
            <div className="relative z-10 flex items-start gap-5 mb-6">

                {/* The Velocity Index */}
                <div className="flex flex-col items-center gap-2">
                    <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
                        <div className={`absolute inset-0 border-2 border-gray-100 dark:border-white/5 rounded-full ${hasData ? 'border-t-cyan-500 dark:border-t-cyan-400 animate-spin' : ''}`} />
                        <div className="text-center bg-white dark:bg-[#0B0F19] rounded-full p-1 relative z-10">
                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{velocityScore}</span>
                        </div>
                    </div>
                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest text-center leading-tight">
                        Relative<br />Velocity
                    </span>
                </div>

                {/* The Narrative */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${hasData ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-500'}`} />
                        <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                            {hasData ? "Intelligence Signal" : "System Idle"}
                        </h4>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight leading-tight">
                        {semantics.headline}
                    </h3>

                    <div className="relative pl-3 border-l-2 border-gray-200 dark:border-white/10">
                        <p className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-wider opacity-70">
                            Signal Interpretation:
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                            "{hasData ? intelligence.ai_analysis : "Awaiting data stream for pattern recognition..."}"
                        </p>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM: VISUAL EVIDENCE --- */}
            <div className="relative z-10 mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest">30-Day Trend</span>
                    <div className={`flex items-center gap-1.5 ${semantics.trendColor}`}>
                        <span className="material-symbols-outlined text-sm">{semantics.trendIcon}</span>
                        <span className="text-[9px] font-mono font-bold uppercase">
                            {semantics.subStatus}
                        </span>
                    </div>
                </div>

                <div className="relative h-12 w-full overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <g className="opacity-20">
                            <line x1="0" y1="40" x2="22" y2="40" stroke="currentColor" strokeWidth="2" />
                            <line x1="26" y1="40" x2="48" y2="40" stroke="currentColor" strokeWidth="2" />
                            <line x1="52" y1="40" x2="74" y2="40" stroke="currentColor" strokeWidth="2" />
                            <line x1="78" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="2" />
                        </g>
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            d={`${pathD} L 100,40 L 0,40 Z`}
                            fill={`url(#${gradientId})`}
                        />
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            d={pathD}
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                </div>
            </div>

        </motion.div>
    );
}