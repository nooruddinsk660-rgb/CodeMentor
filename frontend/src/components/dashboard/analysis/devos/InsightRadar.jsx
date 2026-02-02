import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function InsightRadar({ profile, languages, repos }) {
    // 1. Calculate Metrics (Normalized 0-100)

    // Volume: Based on public repos (Cap at 50 for max score)
    const volumeScore = Math.min((profile?.publicRepos || 0) * 2, 100);

    // Impact: Based on followers + stars (approx)
    // We don't have total stars in profile directly usually, so we use followers as proxy + following ratio
    const impactScore = Math.min(((profile?.followers || 0) * 5), 100);

    // Diversity: Number of languages used
    const languageCount = Object.keys(languages || {}).length;
    const diversityScore = Math.min(languageCount * 15, 100);

    // Consistency: (Mocked for now, or based on recent activity length)
    const consistencyScore = Math.min((repos?.length || 0) * 20, 100);

    // Clarity: Bio existence + Avatar existence
    const clarityScore = (profile?.username ? 20 : 0) + (profile?.avatar ? 40 : 0) + (profile?.followers > 0 ? 40 : 0);

    const data = [
        { subject: "VOLUME", A: volumeScore, fullMark: 100 },
        { subject: "IMPACT", A: impactScore, fullMark: 100 },
        { subject: "DIVERSITY", A: diversityScore, fullMark: 100 },
        { subject: "CONSISTENCY", A: consistencyScore, fullMark: 100 },
        { subject: "CLARITY", A: clarityScore, fullMark: 100 },
    ];

    return (
        <div className="relative p-6 rounded-3xl bg-white/80 dark:bg-[#0B0F19]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 h-full flex flex-col shadow-xl dark:shadow-none transition-colors duration-500">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05)_0%,transparent_70%)] opacity-50 pointer-events-none" />

            {/* HEADER */}
            <div className="flex items-center justify-between mb-2 relative z-10">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-widest flex items-center gap-3">
                    <span className="w-2 h-8 bg-cyan-500 rounded-sm shadow-[0_0_15px_#06b6d4]" />
                    INSIGHT RADAR
                </h3>
            </div>

            <div className="w-full relative z-10 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(148, 163, 184, 0.2)" /> {/* Slate-400 equivalent for broad compatibility */}
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#06b6d4", fontSize: 10, fontFamily: "monospace", letterSpacing: "1px", fontWeight: "bold" }}
                        />
                        <Radar
                            name="DevMetrics"
                            dataKey="A"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            fill="#06b6d4"
                            fillOpacity={0.2}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                {/* Central Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2 h-2 bg-cyan-500 dark:bg-white rounded-full shadow-[0_0_10px_currentColor] animate-pulse" />
                </div>
            </div>

            <div className="text-center font-mono text-[10px] text-cyan-500/50 mt-2">
        // METRICS NORMALIZED TO GLOBAL BASELINE
            </div>
        </div>
    );
}
