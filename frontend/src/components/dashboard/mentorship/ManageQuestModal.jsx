import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManageQuestModal({ isOpen, onClose, quest, onDelete, onUpdate, onAccept }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // Initialize form when opening
    React.useEffect(() => {
        if (quest) {
            setFormData({
                title: quest.title,
                description: quest.description || '',
                difficulty: quest.difficulty || 'intermediate'
            });
        }
    }, [quest]);

    if (!isOpen || !quest) return null;

    const handleSave = () => {
        onUpdate(quest, formData);
        setIsEditing(false);
    };

    const hasAssignee = !!quest.assignee;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* BACKDROP */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* MODAL WINDOW */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-md bg-[#0B0F19] border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400">settings</span>
                            MANAGE BOUNTY
                        </h2>
                        <div className="text-xs font-mono text-purple-400/60 mt-1">ID: {quest._id}</div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {!isEditing ? (
                            // VIEW MODE
                            <>
                                <div className="bg-white/5 p-4 rounded border border-white/10">
                                    <h3 className="text-sm font-bold text-gray-300 mb-1">TARGET OBJECTIVE</h3>
                                    <p className="text-white font-mono text-sm line-clamp-2">{quest.title}</p>

                                    {hasAssignee && (
                                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                                            <span className="text-xs text-green-400 font-bold">ASSIGNED TO:</span>
                                            <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded text-xs text-green-300 border border-green-500/30">
                                                <img src={quest.assignee.avatar || 'https://github.com/github.png'} className="w-4 h-4 rounded-full" />
                                                {quest.assignee.username}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* APPLICANTS LIST */}
                                {!hasAssignee && (
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-blue-400 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">group</span>
                                            APPLICANTS ({quest.applicants?.length || 0})
                                        </h3>
                                        <div className="bg-black/20 rounded border border-white/10 max-h-40 overflow-y-auto">
                                            {quest.applicants?.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-gray-500 italic">No applicants yet.</div>
                                            ) : (
                                                quest.applicants.map(app => (
                                                    <div key={app._id} className="p-2 border-b border-white/5 last:border-0 flex justify-between items-center hover:bg-white/5 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                                <img src={app.avatar || 'https://github.com/github.png'} className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="text-sm text-gray-300">{app.username}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => onAccept(quest, app._id)}
                                                            className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/50 rounded hover:bg-green-500 hover:text-white transition-colors"
                                                        >
                                                            ACCEPT
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex flex-col items-center justify-center p-4 rounded border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-colors group"
                                    >
                                        <span className="material-symbols-outlined text-2xl text-blue-500 mb-2 group-hover:scale-110 transition-transform">edit</span>
                                        <span className="text-xs font-bold text-blue-400">EDIT DETAILS</span>
                                    </button>

                                    <button
                                        onClick={() => onDelete(quest)}
                                        className="flex flex-col items-center justify-center p-4 rounded border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors group"
                                    >
                                        <span className="material-symbols-outlined text-2xl text-red-500 mb-2 group-hover:scale-110 transition-transform">delete</span>
                                        <span className="text-xs font-bold text-red-400">TERMINATE BOUNTY</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            // EDIT MODE
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-purple-400 block mb-1">OBJECTIVE (TITLE)</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-black/40 border border-white/20 rounded p-2 text-sm text-white focus:border-purple-500 outline-none"
                                        placeholder="Bounty Title"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-purple-400 block mb-1">MISSION BRIEF (DESC)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-black/40 border border-white/20 rounded p-2 text-sm text-white focus:border-purple-500 outline-none h-24 resize-none"
                                        placeholder="Description..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-purple-400 block mb-1">DIFFICULTY_LEVEL</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full bg-black/40 border border-white/20 rounded p-2 text-sm text-white focus:border-purple-500 outline-none"
                                    >
                                        <option value="beginner">BEGINNER</option>
                                        <option value="intermediate">INTERMEDIATE</option>
                                        <option value="expert">EXPERT</option>
                                        <option value="god">GOD_MODE</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-2 rounded border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 py-2 rounded bg-purple-500 text-white font-bold text-xs hover:bg-purple-600 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                    >
                                        SAVE CHANGES
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!isEditing && (
                        <div className="p-4 bg-black/40 text-center">
                            <button
                                onClick={onClose}
                                className="text-xs text-gray-500 hover:text-white transition-colors tracking-widest"
                            >
                                // CANCEL_OPERATION
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
