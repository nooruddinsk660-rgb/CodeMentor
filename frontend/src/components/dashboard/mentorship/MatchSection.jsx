import React from 'react';
import MatchCard from './MatchCard';

export default function MatchSection({ loading, matches, connectedIds, onConnect, viewMode, matchMode, setMatchMode, onSearch, onViewProfile }) {

    // Mode options configuration
    const MODES = [
        { id: 'project', label: 'PROJECT PALS', icon: 'handshake' },
        { id: 'mentorship', label: 'MENTORSHIP', icon: 'school' },
        { id: 'peer', label: 'PEER CODING', icon: 'code' }
    ];

    return (
        <div className="flex flex-col w-full">
            {/* UTILITY BAR: MODE & SEARCH */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-2">
                {/* SEARCH BAR */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors">search</span>
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH NODES [USERNAME / BIO]..."
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-300 focus:outline-none focus:border-purple-500/50 focus:bg-purple-50 dark:focus:bg-purple-900/10 transition-all font-mono placeholder:text-gray-400 dark:placeholder:text-gray-700"
                    />
                    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-purple-500 transition-all duration-300 group-focus-within:w-full" />
                </div>

                {/* MODE SWITCHER */}
                <div className="flex bg-white dark:bg-black/20 p-1 rounded-full border border-gray-200 dark:border-white/5 backdrop-blur-sm self-center md:self-auto shadow-sm dark:shadow-none">
                    {MODES.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setMatchMode(mode.id)}
                            className={`px-4 md:px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.1em] flex items-center gap-2 transition-all ${matchMode === mode.id
                                ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-md dark:shadow-lg border border-gray-200 dark:border-white/10'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">{mode.icon}</span>
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* MATCH GRID */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                    <div className="text-purple-600 dark:text-purple-400 font-mono text-sm animate-pulse">Scanning Neural Network...</div>
                </div>
            ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col items-center'} gap-6 pb-20`}>
                    {matches.length === 0 && (
                        <div className="col-span-full text-center py-20 opacity-50">
                            <div className="material-symbols-outlined text-6xl text-gray-500 mb-4 animate-bounce">satellite_alt</div>
                            <p className="text-gray-400 font-mono tracking-widest">NO SIGNALS DETECTED IN SECTOR</p>
                        </div>
                    )}

                    {matches.map((match, i) => (
                        <MatchCard
                            key={match._id}
                            match={match}
                            index={i}
                            connectedIds={connectedIds}
                            onConnect={onConnect}
                            onViewProfile={onViewProfile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

