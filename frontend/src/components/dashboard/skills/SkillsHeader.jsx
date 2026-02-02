import React from "react";

export default function SkillsHeader({ status = "active", visibility = "public" }) {

  // Status Logic (Future-proof)
  const isSyncing = status === "syncing";
  const statusColor = isSyncing ? "bg-yellow-500" : "bg-emerald-500";
  const statusText = isSyncing ? "SYNC IN PROGRESS" : "PROFILE SYNCHRONIZED";

  return (
    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-10 border-b border-gray-200 dark:border-white/5 pb-8 transition-colors duration-500">

      {/* 1. PRIMARY SYSTEM IDENTITY */}
      <div className="space-y-3 max-w-2xl">

        {/* Status Line */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColor}`}></span>
          </span>
          <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${isSyncing ? "text-yellow-500" : "text-emerald-500"}`}>
            {statusText}
          </span>
        </div>

        {/* Title Block */}
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">
            Neural Skill Matrix
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-lg">
            The operational core of your technical identity.
          </p>
        </div>

        {/* 2. CONSEQUENCE LAYER (Why this matters) */}
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wide">
            System Impact
          </span>
          <span className="text-xs text-gray-500">
            Directly influences mentorship matching & project visibility.
          </span>
        </div>
      </div>

      {/* 3. CONTEXTUAL METADATA (Quiet) */}
      <div className="hidden md:flex flex-col items-end gap-1 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3 text-xs font-mono text-gray-400 dark:text-gray-500">
          <span>VISIBILITY: <span className="text-gray-900 dark:text-white font-bold uppercase">{visibility}</span></span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span>LAST UPDATE: <span className="text-gray-900 dark:text-white font-bold">JUST NOW</span></span>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono uppercase tracking-widest">
          v2.1.0 · STABLE
        </p>
      </div>

    </div>
  );
}