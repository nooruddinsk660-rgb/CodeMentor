import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../components/dashboard/Sidebar";
import { useConnections } from "../../hooks/dashboard/useConnections";
import ConnectionList from "../../components/dashboard/connections/ConnectionList";
import ChatTerminal from "../../components/dashboard/connections/ChatTerminal";
import NetworkGraph from "../../components/dashboard/connections/NetworkGraph";

export default function ConnectionsPage() {
    const {
        connections,
        loading,
        pendingConnections,
        activeConnections,
        selectedChatUser,
        showChat,
        activeTab,
        setActiveTab,
        handleOpenChat,
        handleCloseChat,
        user,
        token
    } = useConnections();

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#030712] font-sans text-gray-900 dark:text-slate-200 overflow-hidden transition-colors duration-500">
            <Sidebar />

            <main className="flex-1 relative flex flex-col h-full isolate">

                {/* --- Background Ambience --- */}
                <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                    {/* Floating Particles (CSS Animation) */}
                    <div className="absolute inset-0">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute bg-white/10 rounded-full blur-[1px]"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    width: `${Math.random() * 4 + 1}px`,
                                    height: `${Math.random() * 4 + 1}px`,
                                    animation: `float ${Math.random() * 10 + 10}s linear infinite`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* --- Header --- */}
                <header className="px-8 py-6 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-black/20 backdrop-blur-sm flex justify-between items-center z-20 transition-colors">
                    <div>
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-slate-400 tracking-tight">
                            NEURAL NETWORK
                        </h1>
                        <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">
                            Operations Center • {connections.length} Nodes Online
                        </p>
                    </div>

                    <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/5 transition-colors">
                        <button
                            onClick={() => setActiveTab('network')}
                            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'network' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            GRAPH VIEW
                        </button>
                    </div>
                </header>

                {/* --- Main Content Grid --- */}
                <div className="flex-1 flex overflow-hidden">

                    {/* LEFT SIDEBAR: Connection List */}
                    <aside className="w-80 border-r border-gray-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-sm z-10 flex flex-col transition-colors">
                        <div className="p-4 border-b border-gray-200 dark:border-white/5">
                            <input
                                type="text"
                                placeholder="FILTER NODE SIGNALS..."
                                className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-gray-700 dark:text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>

                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-50 space-y-4">
                                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                <span className="text-[10px] font-mono text-blue-400 animate-pulse">ESTABLISHING UPLINK...</span>
                            </div>
                        ) : (
                            <ConnectionList
                                activeConnections={activeConnections}
                                pendingConnections={pendingConnections}
                                onOpenChat={handleOpenChat}
                            />
                        )}
                    </aside>

                    {/* CENTER: Graph / Content */}
                    <div className="flex-1 relative bg-gray-50/50 dark:bg-black/40 transition-colors">
                        {activeTab === 'network' && (
                            <NetworkGraph
                                connections={connections}
                                onNodeClick={handleOpenChat}
                            />
                        )}

                        {/* Empty State Overlay if No Connections */}
                        {!loading && connections.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center p-10 border border-dashed border-gray-300 dark:border-white/10 rounded-3xl bg-white/80 dark:bg-black/60 backdrop-blur transition-colors">
                                    <div className="text-6xl mb-4 opacity-50">📡</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Network Offline</h3>
                                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">No active neural links detected in this sector.</p>
                                    <a href="/find-mentor" className="pointer-events-auto px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-xs font-bold tracking-widest transition-colors">
                                        INITIATE SCAN PROTOCOL
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Chat Terminal (Slide-in) */}
                    <AnimatePresence>
                        {showChat && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 400, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="h-full z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]"
                            >
                                <ChatTerminal
                                    user={user}
                                    recipient={selectedChatUser}
                                    onClose={handleCloseChat}
                                    token={token}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </main>
        </div>
    );
}