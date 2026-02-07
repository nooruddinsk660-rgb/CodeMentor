import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { Search } from "lucide-react";

export default function Header({ onSearch }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  if (!user) return null;

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
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
          <h2 className="text-white text-2xl md:text-4xl font-black tracking-tighter leading-none animate-in fade-in slide-in-from-left-4 duration-700">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">{user.firstName || user.username}</span>
          </h2>
          <span className="hidden md:inline-block text-xs md:text-sm text-gray-500 font-mono font-bold tracking-[0.2em] uppercase opacity-70">
            / OVERVIEW_PANEL
          </span>
        </div>

        {/* Subtitle Line: System Language */}
        <div className="flex items-center gap-3">
          <p className="text-gray-400 text-xs md:text-sm font-light tracking-wide">
            Telemetry tracking active. All systems nominal.
          </p>

          {/* System Heartbeat (The "Status Slot") */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">NET_ONLINE</span>
          </div>
        </div>
      </div>

      {/* RIGHT: COMMAND INPUT */}
      <div className="w-full md:w-auto">
        <div
          className={`
             relative transition-all duration-300 ease-out group
             ${isFocused
              ? "w-full md:w-96 ring-1 ring-cyan-500/30 bg-[#0B0F19] shadow-[0_0_30px_rgba(6,182,212,0.15)]"
              : "w-full md:w-72 bg-white/5 hover:bg-white/10"
            }
             rounded-xl border border-white/10 backdrop-blur-md
           `}
        >
          {/* Search Icon */}
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isFocused ? "text-cyan-400" : "text-gray-500"}`} />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label="Search dashboard signals"
            className="
              w-full bg-transparent border-none
              pl-11 pr-4 py-3 
              text-sm text-white placeholder-gray-500
              outline-none transition-colors
            "
            placeholder={isFocused ? "Search system logs..." : "Search..."}
          />

          {/* Subtle Shortcut Hint */}
          {!isFocused && !query && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-40 hidden md:flex">
              <span className="text-[9px] font-mono text-gray-400 border border-gray-700 rounded px-1.5 py-0.5">/</span>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}