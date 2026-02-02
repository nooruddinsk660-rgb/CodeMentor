import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateQuestModal({ isOpen, onClose, onSubmit, newQuest, setNewQuest }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0B0F19] border border-yellow-500/30 rounded-2xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(234,179,8,0.2)]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-yellow-400">POST NEW BOUNTY</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-1">BOUNTY TITLE</label>
                            <input
                                type="text"
                                required
                                value={newQuest.title}
                                onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-colors"
                                placeholder="e.g. Need Help with Microservices"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-1">DESCRIPTION</label>
                            <textarea
                                required
                                rows={4}
                                value={newQuest.description}
                                onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-colors"
                                placeholder="Describe your challenge..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-1">DIFFICULTY</label>
                            <select
                                value={newQuest.difficulty}
                                onChange={(e) => setNewQuest({ ...newQuest, difficulty: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                            >
                                <option value="beginner">BEGINNER</option>
                                <option value="intermediate">INTERMEDIATE</option>
                                <option value="advanced">ADVANCED</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded text-sm font-bold text-gray-400 hover:text-white"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                            >
                                POST BOUNTY
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
