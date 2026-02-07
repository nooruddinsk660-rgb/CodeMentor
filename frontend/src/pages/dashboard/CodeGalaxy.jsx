import React, { useEffect, useState, useRef, useMemo } from "react";
// import ForceGraph3D from "react-force-graph-3d"; // Removed for Clean Tech Upgrade
import { useAuth } from "../../auth/AuthContext";
import { githubService } from "../../services/github.service";
import { transformRepoToGraph } from "../../utils/graphTransformer";
import Sidebar from "../../components/dashboard/Sidebar";
import DevOSBackground from "../../components/layout/DevOSBackground";
import { motion, AnimatePresence } from "framer-motion";

export default function CodeGalaxy() {
    const { token, user } = useAuth();
    const fgRef = useRef();

    // State
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [warpSpeed, setWarpSpeed] = useState(false);
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    // 1. Fetch Repositories on Mount
    useEffect(() => {
        if (!token || !user?.username) return;

        setLoading(true);
        githubService.getRepositories(user.username, token)
            .then(response => {
                // ROBUST HANDLING: Ensure we always have an array
                const repoList = Array.isArray(response.data) ? response.data : [];
                setRepos(repoList);

                if (repoList.length > 0) {
                    // Sort by stars descending
                    const bestRepo = [...repoList].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))[0];
                    setSelectedRepo(bestRepo);
                }
            })
            .catch(err => {
                console.error("Failed to load repos", err);
                // Fallback to empty array prevents crashes
                setRepos([]);
            })
            .finally(() => setLoading(false));
    }, [token, user]);

    // 2. Fetch/Generate Graph Data
    // 2. Fetch/Generate Graph Data
    useEffect(() => {
        if (!selectedRepo) return;

        setLoading(true);
        githubService.getRepoTree(user.username, selectedRepo.name, token)
            .then(response => {
                const tree = response.data || [];
                // Transform real GitHub tree (flat list with paths) into graph
                const gData = transformRepoToGraph(tree);
                setGraphData(gData);
            })
            .catch(err => {
                console.error("Failed to load repo tree", err);
                setGraphData({ nodes: [], links: [] });
            })
            .finally(() => setLoading(false));

    }, [selectedRepo, token, user.username]);

    // 3. Camera Orbit & Physics
    // 3. Camera Orbit & Physics (Auto Rotation)
    // 3. Camera Orbit & Physics (Auto Rotation)
    useEffect(() => {
        if (!fgRef.current) return;

        // Initial Physics
        fgRef.current.d3Force('charge').strength(-150);
        fgRef.current.d3Force('link').distance(40);

        // Rotation Logic
        let angle = 0;
        const distance = 300;

        const interval = setInterval(() => {
            if (isAutoRotating && !warpSpeed && fgRef.current) {
                angle += 0.001; // Slow rotation speed
                fgRef.current.cameraPosition({
                    x: distance * Math.sin(angle),
                    z: distance * Math.cos(angle)
                });
            }
        }, 10);

        // Stop rotation on user interaction (mousedown)
        const canvas = fgRef.current.renderer().domElement;
        const stopRotation = () => { setIsAutoRotating(false); };
        canvas.addEventListener('mousedown', stopRotation);

        return () => {
            clearInterval(interval);
            canvas.removeEventListener('mousedown', stopRotation);
        };
    }, [graphData, warpSpeed, isAutoRotating]);


    // --- ACTIONS ---
    const handleWarp = () => {
        if (fgRef.current) {
            setWarpSpeed(true);
            setIsAutoRotating(false); // Stop rotation
            // Pull back
            fgRef.current.cameraPosition(
                { x: 0, y: 0, z: 400 },
                { x: 0, y: 0, z: 0 },
                500
            );

            // Warp in after short delay
            setTimeout(() => {
                fgRef.current.cameraPosition(
                    { x: 50, y: 20, z: 50 },
                    { x: 0, y: 0, z: 0 },
                    1500
                );
                setTimeout(() => setWarpSpeed(false), 1500);
            }, 600);
        }
    };

    const handleShockwave = () => {
        if (fgRef.current) {
            // Re-heat the simulation
            fgRef.current.d3ReheatSimulation();
            // Temporary explode force
            fgRef.current.d3Force('charge').strength(-500);
            setTimeout(() => {
                fgRef.current.d3Force('charge').strength(-120);
            }, 1000);
        }
    };



    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#050510] text-gray-900 dark:text-slate-200 font-sans overflow-hidden selection:bg-cyan-500/30 transition-colors duration-500">
            {/* Global DevOS Background Layer (Applied here specifically for this view) */}
            <DevOSBackground />

            {/* Sidebar (Now floating) */}
            <Sidebar />

            <main className="flex-1 relative z-10 h-full">

                {/* --- HEADER HUD --- */}
                <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-30 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-4"
                    >
                        <div className="p-2 lg:p-3 rounded-2xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                            <span className="material-symbols-outlined text-2xl lg:text-3xl text-cyan-600 dark:text-cyan-400">hub</span>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-cyan-600 to-cyan-400 dark:from-white dark:via-cyan-100 dark:to-cyan-400 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                Neural Galaxy
                            </h1>
                            <div className="flex items-center gap-2 mt-1 px-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400 animate-bounce' : 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse'}`} />
                                <p className="text-[8px] lg:text-[10px] font-bold text-cyan-500/80 uppercase tracking-[0.25em]">
                                    {loading ? 'CALIBRATING SYSTEM...' : `VISUALIZATION LINKED • ${repos.length} REPOS`}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- CONTROLS Top Right --- */}
                <div className="absolute top-24 right-4 lg:top-8 lg:right-8 z-30 flex flex-col gap-4 items-end pointer-events-auto">

                    {/* Repo Select */}
                    <div className="relative group min-w-[200px] lg:min-w-[240px]">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-75 transition duration-500" />
                        <div className="relative bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10 p-1 flex items-center">
                            <div className="pl-3 pr-2 text-cyan-600 dark:text-cyan-500">
                                <span className="material-symbols-outlined text-lg">folder_open</span>
                            </div>
                            <select
                                value={selectedRepo?.name || ""}
                                onChange={(e) => {
                                    const r = repos.find(rp => rp.name === e.target.value);
                                    setSelectedRepo(r);
                                }}
                                className="bg-transparent text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider py-2.5 outline-none w-full cursor-pointer appearance-none"
                            >
                                {repos.map((r, i) => (
                                    <option key={r.id || i} className="bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white" value={r.name}>
                                        {r.name.toUpperCase()} // {r.language || 'UNK'}
                                    </option>
                                ))}
                            </select>
                            <div className="pr-3 pointer-events-none text-white/40">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <ActionButton
                            icon="rocket_launch"
                            label="WARP"
                            onClick={handleWarp}
                            color="cyan"
                        />
                        <ActionButton
                            icon="waves"
                            label="SHOCK"
                            onClick={handleShockwave}
                            color="purple"
                        />
                    </div>
                </div>

                {/* --- FOOTER STATS --- */}
                <div className="absolute bottom-20 left-4 lg:bottom-8 lg:left-8 z-30 flex flex-col gap-2 pointer-events-none w-[90%] lg:w-auto">
                    <p className="text-[10px] text-gray-400 dark:text-white/30 font-mono pl-1 mb-1 hidden lg:block">REALTIME METRICS</p>
                    <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <HudMetric
                            label="NODES"
                            value={graphData.nodes.length}
                            icon="data_object"
                            color="text-cyan-600 dark:text-cyan-400"
                            borderColor="border-cyan-500/20"
                        />
                        <HudMetric
                            label="CONNECTIONS"
                            value={graphData.links.length}
                            icon="share"
                            color="text-purple-600 dark:text-purple-400"
                            borderColor="border-purple-500/20"
                        />
                        <HudMetric
                            label="COMPLEXITY"
                            value={loading ? "CALC" : ((graphData.nodes.length * 1.5) + " IQ")}
                            icon="psychology"
                            color="text-emerald-600 dark:text-emerald-400"
                            borderColor="border-emerald-500/20"
                        />
                    </div>
                </div>

                {/* --- 3D VIEWPORT --- */}
                <div className="absolute inset-0 z-0 flex items-center justify-center bg-gray-50/50 dark:bg-[#050510]/50 backdrop-blur-sm">
                    <div className="text-center p-8 border border-cyan-500/20 rounded-2xl bg-white/10 dark:bg-black/20">
                        <span className="material-symbols-outlined text-4xl text-cyan-500 mb-4 animate-pulse">hub</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Neural Galaxy Upgrade</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-sm max-w-md mx-auto">
                            The 3D visualization engine is currently being upgraded to the new Ceramic Core architecture.
                            Please check back later for the 2.0 Visualization.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- SUB COMPONENTS ---

function ActionButton({ icon, label, onClick, color }) {
    const colors = {
        cyan: "hover:bg-cyan-100 dark:hover:bg-cyan-500/20 hover:border-cyan-500 dark:hover:border-cyan-400 text-cyan-600 dark:text-cyan-400",
        purple: "hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-500 dark:hover:border-purple-400 text-purple-600 dark:text-purple-400"
    };

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 ${colors[color]} font-bold text-[10px] tracking-[0.2em] transition-all active:scale-95 flex items-center gap-2 group shadow-lg`}
        >
            <span className="material-symbols-outlined text-lg group-hover:animate-pulse">{icon}</span>
            {label}
        </button>
    )
}

function HudMetric({ label, value, icon, color, borderColor }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white/40 dark:bg-[#0B0F19]/40 backdrop-blur-md border ${borderColor} min-w-[140px]`}>
            <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
            <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{label}</div>
                <div className={`text-lg font-mono font-bold text-gray-900 dark:text-white leading-none`}>{value}</div>
            </div>
        </div>
    )
}
