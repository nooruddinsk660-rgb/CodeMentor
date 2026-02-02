import React from "react";
import { formatDistanceToNow } from "date-fns";

export default function PageHeading({ onRefresh, isRefreshing, lastSync }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          Profile Analysis
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-400">
           <span>Deep-dive into repository composition & activity metrics.</span>
           {lastSync && (
               <>
                 <span className="w-1 h-1 bg-gray-600 rounded-full" />
                 <span className="font-mono text-xs text-emerald-400">
                    Synced {formatDistanceToNow(lastSync, { addSuffix: true })}
                 </span>
               </>
           )}
        </div>
      </div>

      <button 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="h-10 px-5 rounded-xl border border-white/10 bg-white/5 
                   hover:bg-white/10 hover:border-white/20 active:scale-95
                   text-sm font-bold text-white transition-all flex items-center gap-2"
      >
        <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
            sync
        </span>
        {isRefreshing ? "Syncing..." : "Update Analysis"}
      </button>
    </div>
  );
}