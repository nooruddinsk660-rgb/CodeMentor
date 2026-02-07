import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CodeCube({ size = 300 }) {
    // Auto-rotate animation
    const rotateAnimation = {
        rotateX: [0, 360],
        rotateY: [0, 360],
        transition: {
            duration: 25,
            ease: "linear",
            repeat: Infinity,
        },
    };

    const faceStyle = "absolute inset-0 flex flex-col items-center justify-center border border-cyan-500/20 bg-black/80 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden";
    const offset = size / 2;

    // Typing Effect Logic (Multi-line)
    const [textIndex, setTextIndex] = useState(0);
    const codeLines = [
        "const dev = new Human();",
        "await dev.learn('React');",
        "dev.upgrade({ iq: 200 });",
        "if (dev.isReady) {",
        "  deploy(dev);",
        "}",
        "// System: ONLINE"
    ];

    const [displayedLines, setDisplayedLines] = useState([]);

    // System Stats Logic
    const [stats, setStats] = useState({ cpu: 12, mem: 45, net: 100 });

    useEffect(() => {
        const t = setInterval(() => {
            setTextIndex(prev => (prev + 1) % (codeLines.length + 1));
        }, 400); // Faster typing

        const s = setInterval(() => {
            setStats({
                cpu: Math.floor(Math.random() * 50) + 10,
                mem: Math.floor(Math.random() * 40) + 30,
                net: Math.floor(Math.random() * 20) + 80,
            });
        }, 1000);

        return () => { clearInterval(t); clearInterval(s); };
    }, []);

    useEffect(() => {
        if (textIndex === 0) {
            setDisplayedLines([]);
        } else {
            setDisplayedLines(codeLines.slice(0, textIndex));
        }
    }, [textIndex]);

    return (
        <div
            className="perspective-1000 relative flex items-center justify-center"
            style={{ width: size, height: size, perspective: "1200px" }}
        >
            <motion.div
                className="relative preserve-3d w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={rotateAnimation}
            >
                {/* --- FACES --- */}

                {/* FRONT: TERMINAL (Main Code) */}
                <div className={faceStyle} style={{ transform: `rotateY(0deg) translateZ(${offset}px)` }}>
                    <div className="w-full h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <div className="p-5 font-mono text-sm md:text-base text-left w-full h-full text-gray-100 leading-7 overflow-hidden">
                        {displayedLines.map((line, i) => (
                            <div key={i} className="whitespace-nowrap">
                                <span className="text-gray-500 select-none mr-3 w-4 inline-block text-right">{i + 1}</span>
                                {line.includes('const') ? <span className="text-purple-400 font-bold">const</span> : null}
                                {line.includes('new') ? <span className="text-yellow-400 font-bold">new</span> : null}
                                {line.includes('await') ? <span className="text-blue-400 font-bold">await</span> : null}
                                {line.includes('if') ? <span className="text-red-400 font-bold">if</span> : null}
                                {line.includes('//') ? <span className="text-gray-400 italic">{line}</span> : <span className="text-cyan-200">{line.replace(/(const|new|await|if)/g, '')}</span>}
                            </div>
                        ))}
                        <span className="animate-pulse text-cyan-400 font-bold text-lg">_</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
                </div>

                {/* RIGHT: SYSTEM METRICS (Live) */}
                <div className={faceStyle} style={{ transform: `rotateY(90deg) translateZ(${offset}px)` }}>
                    <div className="w-full p-6 space-y-4 font-mono text-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4">Sys_Monitor</div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-cyan-300">
                                <span className="tracking-wider">CPU_LOAD</span>
                                <span className="font-bold">{stats.cpu}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.cpu}%` }} transition={{ duration: 0.5 }} className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-purple-300">
                                <span className="tracking-wider">MEM_USAGE</span>
                                <span className="font-bold">{stats.mem}GB</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.mem}%` }} transition={{ duration: 0.5 }} className="h-full bg-purple-400 shadow-[0_0_10px_#a855f7]" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-green-300">
                                <span className="tracking-wider">NET_STABILITY</span>
                                <span className="font-bold">{stats.net}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.net}%` }} transition={{ duration: 0.5 }} className="h-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* BACK: BRACKETS */}
                <div className={faceStyle} style={{ transform: `rotateY(180deg) translateZ(${offset}px)` }}>
                    <div className="text-8xl font-black text-white/5 tracking-tighter select-none">
                        {"</>"}
                    </div>

                    {/* Floating Particles inside */}
                    <div className="absolute inset-0">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                                initial={{ x: 0, y: 0, opacity: 0 }}
                                animate={{
                                    x: Math.random() * 100 - 50,
                                    y: Math.random() * 100 - 50,
                                    opacity: [0, 1, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                                style={{ left: '50%', top: '50%' }}
                            />
                        ))}
                    </div>
                </div>

                {/* LEFT: LOGIC */}
                <div className={faceStyle} style={{ transform: `rotateY(-90deg) translateZ(${offset}px)` }}>
                    <div className="text-6xl font-black text-white/5 select-none">!=</div>
                    <div className="absolute bottom-4 left-4 right-4 text-[10px] font-mono text-cyan-500/60 text-center">
                        AWAITING_INPUT...
                    </div>
                </div>

                {/* TOP: CORE */}
                <div className={faceStyle} style={{ transform: `rotateX(90deg) translateZ(${offset}px)` }}>
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500/30 animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse blur-[5px]" />
                    </div>
                </div>

                {/* BOTTOM: BASE */}
                <div className={faceStyle} style={{ transform: `rotateX(-90deg) translateZ(${offset}px)` }}>
                    <div className="w-24 h-24 bg-cyan-900/30 blur-2xl rounded-full" />
                </div>

                {/* --- ORBITING SATELLITES (3D Elements) --- */}

                {/* React Electron */}
                <div
                    className="absolute w-8 h-8 flex items-center justify-center"
                    style={{ transform: `rotateY(45deg) translateZ(${size * 0.75}px)` }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full border border-cyan-500/40 rounded-full"
                    />
                    <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                </div>

                {/* JS Badge */}
                <div
                    className="absolute w-8 h-8 bg-yellow-500/10 border border-yellow-500/40 rounded flex items-center justify-center font-bold text-yellow-500 text-[10px] shadow-[0_0_15px_rgba(234,179,8,0.2)] backdrop-blur-sm"
                    style={{ transform: `rotateX(-20deg) rotateY(130deg) translateZ(${size * 0.85}px)` }}
                >
                    JS
                </div>

                {/* TypeScript Badge */}
                <div
                    className="absolute w-8 h-8 bg-blue-600/10 border border-blue-500/40 rounded flex items-center justify-center font-bold text-blue-500 text-[10px] shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-sm"
                    style={{ transform: `rotateX(40deg) rotateY(-60deg) translateZ(${size * 0.85}px)` }}
                >
                    TS
                </div>

                {/* Internal Glow Core */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-1/3 h-1/3 bg-cyan-500 rounded-full blur-[80px] opacity-30 animate-pulse" />
                </div>

            </motion.div>
        </div>
    );
}
