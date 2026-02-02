import React, { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

export default function MentorshipHeader({
    activeTab,
    setActiveTab,
    unreadCount,
    unreadDetails = [],
    onNotificationClick,
    onNotificationItemClick,
    showTerminal,
    setShowTerminal,
    ghostMode,
    setGhostMode,
    viewMode,
    setViewMode
}) {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="flex-shrink-0 px-8 py-6 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#050510] relative z-20 flex justify-between items-center transition-colors duration-500">
            <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 tracking-wider">
                    MENTORSHIP_NEXUS
                </h1>
                <p className="text-purple-500/50 font-mono text-xs tracking-[0.2em] mt-1">
                    // FIND_ALLIES // EXPAND_NETWORK
                </p>
            </div>

            {/* PILLAR 2 CONTROLS */}
            <div className="flex gap-4 items-center bg-gray-100 dark:bg-black/40 p-1 rounded-lg border border-gray-200 dark:border-white/10 transition-colors">
                {/* TABS */}
                <div className="flex gap-1">
                    {['matches', 'quests'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded text-xs font-bold tracking-wider transition-all ${activeTab === tab
                                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/50 shadow-sm dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 items-center relative">
                {/* NOTIFICATION BADGE */}
                {unreadCount > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="group animate-pulse flex items-center gap-1 bg-red-500/20 border border-red-500 text-red-500 px-3 py-1 rounded-full text-xs font-bold mr-2 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm">mail</span>
                            {unreadCount} NEW
                        </button>

                        <NotificationDropdown
                            isOpen={showNotifications}
                            onClose={() => setShowNotifications(false)}
                            notifications={unreadDetails}
                            onItemClick={(sender) => {
                                onNotificationItemClick(sender);
                                setShowNotifications(false);
                            }}
                        />
                    </div>
                )}

                <button
                    onClick={() => setShowTerminal(!showTerminal)}
                    className={`p-2 rounded-lg border flex items-center gap-2 mr-2 transition-all ${showTerminal ? 'bg-green-100 dark:bg-green-500/20 border-green-500 text-green-600 dark:text-green-400' : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    title="Toggle Neural CLI"
                >
                    <span className="material-symbols-outlined">terminal</span>
                </button>

                <button
                    onClick={() => setGhostMode(!ghostMode)}
                    className={`p-2 rounded-lg border flex items-center gap-2 mr-4 transition-all ${ghostMode ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 animate-pulse' : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <span className="material-symbols-outlined">{ghostMode ? 'visibility_off' : 'visibility'}</span>
                </button>

                <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mr-2" />

                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500'}`}>
                    <span className="material-symbols-outlined">grid_view</span>
                </button>
            </div>
        </div>
    );
}
