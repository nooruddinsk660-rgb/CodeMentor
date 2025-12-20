import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Mock hook - in a real app, this comes from your AuthContext
const useAuth = () => ({
  user: {
    name: "Alex",
    avatar: "https://i.pravatar.cc/150?u=alex", // Placeholder avatar
    notifications: 3
  }
});

export default function Header({ onSearch }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for the search input
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && query.trim()) {
      // Option A: Call a prop function to filter the current page
      if (onSearch) onSearch(query);
      
      // Option B: Navigate to a search results page
      // navigate(`/search?q=${query}`);
      
      console.log(`Searching for: ${query}`);
    }
  };

  const handleNewSession = () => {
    // Navigate to create new session or open modal
    navigate("/dashboard");
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      {/* 1. Dynamic Greeting Section */}
      <div>
        <h2 className="text-white text-3xl font-black tracking-tight">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{user.name}!</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Here is what’s happening with your projects today.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* 2. Interactive Search Bar */}
        <div className={`relative transition-all duration-300 ${isFocused ? 'w-72' : 'w-64'}`}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full bg-[#0B0F19] border text-sm text-white rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all
              ${isFocused 
                ? "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-[#111625]" 
                : "border-white/10 hover:border-white/20"
              }
            `}
            placeholder="Search analysis, skills..."
            aria-label="Search"
          />
        </div>

        {/* 3. Notification Bell (Visual Interactivity) */}
        <button className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors group">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          {user.notifications > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#0B0F19] rounded-full animate-pulse" />
          )}
        </button>

        {/* 4. "Active" Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleNewSession}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Session
        </motion.button>
      </div>
    </header>
  );
}