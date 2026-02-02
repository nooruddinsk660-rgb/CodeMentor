import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationDropdown({ isOpen, onClose, notifications, onItemClick }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to close on click outside */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-80 bg-[#0B0F19] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                    >
                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <h3 className="text-xs font-bold text-slate-400 tracking-wider">INCOMING TRANSMISSIONS</h3>
                            <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                                {notifications.length} ACTIVE
                            </span>
                        </div>

                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <span className="material-symbols-outlined text-3xl mb-2 opacity-50">inbox</span>
                                    <p className="text-xs">No new signals detected.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notif, idx) => (
                                        <button
                                            key={notif.sender._id || idx}
                                            onClick={() => onItemClick(notif.sender)}
                                            className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left group"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={notif.sender.avatar || "https://github.com/github.png"}
                                                    alt={notif.sender.username}
                                                    className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-blue-500/50 transition-colors"
                                                />
                                                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-black">
                                                    {notif.count}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                                                        {notif.sender.fullName || notif.sender.username}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        {new Date(notif.latestCreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 truncate group-hover:text-slate-300">
                                                    {notif.latestContent}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-2 bg-black/20 border-t border-white/5">
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-center text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Close Panel
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
