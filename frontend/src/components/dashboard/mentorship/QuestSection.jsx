import React from 'react';
import QuestCard from './QuestCard';

export default function QuestSection({ loading, quests, user, onContact, onManage, onOpenCreateModal, onApply }) {
    return (
        <div className="flex flex-col w-full pb-20">
            {/* QUEST BOARD HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-500">
                    ACTIVE BOUNTIES
                </h2>
                <button
                    onClick={onOpenCreateModal}
                    className="px-4 py-2 rounded bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-500 hover:text-black transition-colors text-xs font-bold"
                >
                    + POST NEW BOUNTY
                </button>
            </div>

            {/* QUEST LIST */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-yellow-200 dark:border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-4" />
                    <div className="text-yellow-600 dark:text-yellow-400 font-mono text-sm animate-pulse">RETRIEVING GUILD REQUESTS...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quests.length === 0 && (
                        <div className="col-span-full text-center py-20 opacity-50">
                            <div className="text-6xl mb-4">📜</div>
                            <p className="text-gray-400 dark:text-gray-400 font-mono tracking-widest">NO ACTIVE QUESTS FOUND</p>
                            <p className="text-xs mt-2 text-gray-500 dark:text-gray-600">Post a bounty to start a collaboration</p>
                        </div>
                    )}

                    {quests.map((quest, i) => (
                        <QuestCard
                            key={quest._id}
                            quest={quest}
                            user={user}
                            index={i}
                            onContact={onContact}
                            onManage={onManage}
                            onApply={onApply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
