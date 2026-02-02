import React from 'react';
import { motion } from 'framer-motion';

export default function NetworkGraph({ connections, onNodeClick }) {
    // Determine Central Node (You)
    const center = { x: 50, y: 50 };

    // Distribute connections in a circle
    const radius = 35; // % of container
    const nodes = connections.map((conn, i) => {
        const angle = (i / connections.length) * 2 * Math.PI;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        return { ...conn, x, y };
    });

    return (
        <div className="relative w-full h-full flex items-center justify-center p-10 overflow-hidden">
            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none" />

            <div className="relative w-full max-w-2xl aspect-square">
                {/* CONNECTIONS LINES */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {nodes.map((node, i) => (
                        <motion.line
                            key={`line-${i}`}
                            x1={`${center.x}%`}
                            y1={`${center.y}%`}
                            x2={`${node.x}%`}
                            y2={`${node.y}%`}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.1 }}
                            className="stroke-blue-500/20"
                            strokeWidth="1"
                        />
                    ))}
                    {/* Pulse Circles */}
                    <circle cx="50%" cy="50%" r="15%" className="fill-none stroke-blue-500/10 stroke-[1] animate-[ping_3s_linear_infinite]" />
                    <circle cx="50%" cy="50%" r="35%" className="fill-none stroke-purple-500/10 stroke-[1]" />
                </svg>

                {/* CENTRAL NODE (YOU) */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                        <div className="w-20 h-20 rounded-full border-4 border-blue-500/50 bg-white dark:bg-black/80 backdrop-blur-sm shadow-[0_0_50px_rgba(59,130,246,0.4)] flex items-center justify-center relative group z-10 transition-transform active:scale-95 cursor-pointer">
                            <span className="material-symbols-outlined text-4xl text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-white transition-colors group-hover:animate-spin-slow">hub</span>
                            <div className="absolute -bottom-8 text-[10px] font-bold font-mono text-blue-600 dark:text-blue-300 tracking-[0.2em] bg-white/80 dark:bg-black/60 px-3 py-1 rounded border border-blue-500/20">YOU</div>
                        </div>
                    </div>
                </motion.div>

                {/* CONNECTION NODES */}
                {nodes.map((node, i) => (
                    <motion.div
                        key={node.matchedUserId}
                        className="absolute w-12 h-12 -ml-6 -mt-6 z-20 cursor-pointer group"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 + 0.5 }}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => onNodeClick(node.user)}
                    >
                        {/* Avatar Node */}
                        <div className={`w-full h-full rounded-full border-2 p-[2px] bg-black transition-colors ${node.status === 'pending' ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                            }`}>
                            <img
                                src={node.user?.avatar || `https://ui-avatars.com/api/?name=${node.user?.username}`}
                                className="w-full h-full rounded-full object-cover opacity-80 group-hover:opacity-100"
                                alt="user"
                            />
                        </div>

                        {/* Hover Tooltip */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/80 backdrop-blur border border-gray-200 dark:border-white/10 px-3 py-1 rounded text-center whitespace-nowrap pointer-events-none z-30 shadow-lg">
                            <div className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">{node.user?.fullName}</div>
                            <div className="text-[9px] font-mono text-gray-500 dark:text-slate-400">@{node.user?.username}</div>
                            {node.matchScore && <div className="text-[9px] text-green-600 dark:text-green-400 font-mono mt-1">SYNERGY: {node.matchScore}%</div>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
