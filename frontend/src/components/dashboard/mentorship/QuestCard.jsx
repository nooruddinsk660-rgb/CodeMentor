import React from 'react';
import { motion } from 'framer-motion';

export default function QuestCard({ quest, user, index, onContact, onManage, onApply }) {
    // Robust comparison for User ID (handle _id, id, userId)
    const currentUserId = user?._id || user?.id || user?.userId;
    const creatorId = quest.creator?._id || quest.creator;

    // Check if user is creator
    const isCreator = currentUserId && creatorId && String(currentUserId) === String(creatorId);

    // console.log(`[QuestCard] ${quest.title}: User=${currentUserId}, Creator=${creatorId}, match=${isCreator}`);

    const hasApplied = quest.applicants?.some(a => String(a._id || a) === String(currentUserId));
    const isAssigned = !!quest.assignee;
    const isAssignee = isAssigned && String(quest.assignee._id || quest.assignee) === String(currentUserId);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white dark:bg-[#0B0F19]/90 border ${isCreator ? 'border-purple-200 dark:border-purple-500/50' : isAssignee ? 'border-green-200 dark:border-green-500/50' : 'border-yellow-200 dark:border-yellow-500/20'} rounded-xl p-6 hover:shadow-lg hover:border-yellow-400 dark:hover:border-yellow-500/50 transition-all group overflow-hidden`}
        >
            <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity ${isCreator ? 'text-purple-600 dark:text-purple-500' : 'text-yellow-600 dark:text-yellow-500'}`}>
                <span className="material-symbols-outlined">{isCreator ? 'verified_user' : 'swords'}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                    <img src={quest.creator?.avatar || 'https://github.com/github.png'} className="w-full h-full object-cover" alt="creator" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono flex items-center gap-2">
                        {quest.creator?.username || 'Unknown'}
                        {isCreator && <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1 rounded text-[8px] font-bold">YOU</span>}
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-2">{quest.title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-500 mb-6 font-mono leading-relaxed h-12 overflow-hidden">
                {quest.description}
            </p>

            {/* Status / Difficulty Row */}
            <div className="flex gap-2 mb-4 items-center flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${quest.difficulty === 'advanced' ? 'border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20' :
                    quest.difficulty === 'intermediate' ? 'border-yellow-200 dark:border-yellow-500/50 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                        'border-green-200 dark:border-green-500/50 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20'
                    }`}>
                    {quest.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-purple-200 dark:border-purple-500/50 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20">
                    {quest.xpReward || 100} XP
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                    {quest.applicants?.length || 0} APPLICANTS
                </span>
                {isAssignee && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-200 dark:border-green-500/50 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">ASSIGNED TO YOU</span>}
            </div>

            {isCreator ? (
                <button
                    onClick={() => onManage(quest)}
                    className="w-full py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white transition-colors rounded text-xs font-bold flex items-center justify-center gap-2 relative"
                >
                    <span className="material-symbols-outlined text-sm">settings</span>
                    MANAGE BOUNTY
                    {quest.applicants?.length > 0 && !isAssigned && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </button>
            ) : (
                <div className="flex gap-2">
                    {user && (
                        <button
                            onClick={() => onContact(quest.creator?._id, quest.title)}
                            className="flex-1 py-2 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-black transition-colors rounded text-xs font-bold flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">mail</span>
                            CHAT
                        </button>
                    )}
                    {!isAssigned && user && (
                        <button
                            onClick={() => !hasApplied && onApply(quest)}
                            disabled={hasApplied}
                            className={`flex-1 py-2 border rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors ${hasApplied
                                ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">{hasApplied ? 'check_circle' : 'rocket_launch'}</span>
                            {hasApplied ? 'APPLIED' : 'APPLY'}
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
