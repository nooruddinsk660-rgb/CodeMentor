import React from 'react';
import { motion } from 'framer-motion';

export default function ConnectionList({
    activeConnections,
    pendingConnections,
    onOpenChat
}) {
    return (
        <div className="h-full flex flex-col gap-6 p-4 overflow-y-auto custom-scrollbar">

            {/* PENDING REQUESTS */}
            {pendingConnections.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest px-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Incoming Signals ({pendingConnections.length})
                    </h3>
                    {pendingConnections.map((conn) => (
                        <ConnectionCard
                            key={conn.matchedUserId}
                            conn={conn}
                            isPending={true}
                            onOpenChat={onOpenChat}
                        />
                    ))}
                </div>
            )}

            {/* ACTIVE UPLINKS */}
            <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-green-500 uppercase tracking-widest px-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_currentColor]" />
                    Active Uplinks ({activeConnections.length})
                </h3>

                {activeConnections.length === 0 && (
                    <div className="p-4 border border-dashed border-gray-300 dark:border-white/10 rounded-xl text-center">
                        <p className="text-xs text-gray-500 dark:text-slate-500">No active links established.</p>
                    </div>
                )}

                {activeConnections.map((conn) => (
                    <ConnectionCard
                        key={conn.matchedUserId}
                        conn={conn}
                        isPending={false}
                        onOpenChat={onOpenChat}
                    />
                ))}
            </div>
        </div>
    );
}

function ConnectionCard({ conn, isPending, onOpenChat }) {
    const user = conn.user;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${isPending
                ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/10'
                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                }`}
            onClick={() => onOpenChat(user)}
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=0D8ABC&color=fff`}
                        alt={user?.username}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-200 dark:bg-black/50"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#030712] ${isPending ? 'bg-amber-500 animate-ping' : 'bg-green-500'
                        }`} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {user?.fullName || user?.username}
                        </h4>
                        {!isPending && (
                            <span className="text-[10px] font-mono text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-black/30 px-1.5 rounded">
                                {conn.matchScore}%
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-slate-500 truncate font-mono">
                        @{user?.username} • {user?.company || 'Freelance'}
                    </p>
                </div>
            </div>

            {/* Hover Action */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white">
                    <span className="material-symbols-outlined text-sm">chat</span>
                </button>
            </div>
        </motion.div>
    );
}
