import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";

export default function Header({ onSearch }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // 1. AUTH GUARD
  if (!user) return null;

  // 2. CONTEXTUAL INTELLIGENCE (Time-aware greeting)
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && query.trim()) {
      if (onSearch) onSearch(query);
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">

      {/* LEFT: CONTEXT & SYSTEM STATUS */}
      <div className="space-y-2">

        {/* Top Line: Greeting + Context Mode */}
        <div className="flex items-baseline gap-3">
          <h2 className="text-gray-900 dark:text-white text-3xl font-black tracking-tight leading-none">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">{user.firstName || user.username}</span>
          </h2>
          <span className="hidden md:inline-block text-lg text-gray-400 dark:text-gray-600 font-mono font-bold tracking-widest">
            / OVERVIEW
          </span>
        </div>

        {/* Subtitle Line: System Language */}
        <div className="flex items-center gap-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Telemetry tracking active. All systems nominal.
          </p>

          {/* System Heartbeat (The "Status Slot") */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-wider">NET: ONLINE</span>
          </div>
        </div>
      </div>

      {/* RIGHT: COMMAND INPUT */}
      <div className="w-full md:w-auto">
        <div
          className={`
             relative transition-all duration-300 ease-out group
             ${isFocused ? "w-full md:w-80 ring-1 ring-blue-500/30 bg-blue-50 dark:bg-blue-900/10" : "w-full md:w-64 bg-white/50 dark:bg-[#0B0F19] hover:bg-white/80 dark:hover:bg-white/5"}
           `}
        >
          {/* Search Icon */}
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] transition-colors ${isFocused ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
            search
          </span>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label="Search dashboard signals"
            className="
              w-full bg-transparent border border-transparent dark:border-white/10 rounded-xl 
              pl-11 pr-4 py-3 
              text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
              outline-none transition-colors
              focus:border-blue-500/50
            "
            placeholder={isFocused ? "Type to filter signals..." : "Search..."}
          />

          {/* Subtle Shortcut Hint (Visual only for now) */}
          {!isFocused && !query && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-40">
              <span className="text-[10px] font-mono text-gray-400 border border-gray-600 rounded px-1">/</span>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}