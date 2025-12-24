import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";


export default function Header({ onSearch }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  if (!user) return null; // prevents render before auth hydration

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && query.trim()) {
      if (onSearch) onSearch(query);
    }
  };


  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-white text-3xl font-black tracking-tight">
          Welcome back,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            {user.fullName || user.username}
          </span>
          !
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Here is what’s happening with your projects today.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className={`relative transition-all duration-300 ${isFocused ? "w-72" : "w-64"}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-[#0B0F19] border text-sm text-white rounded-xl pl-4 pr-4 py-2.5 outline-none"
            placeholder="Search analysis, skills..."
          />
        </div>
      </div>
    </header>
  );
}
