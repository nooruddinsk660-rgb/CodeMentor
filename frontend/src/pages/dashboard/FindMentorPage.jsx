import React, { useState } from "react";
import {useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import NeuralMatchDeck from "../../components/dashboard/NeuralMatchDeck";
import Sidebar from "../../components/dashboard/Sidebar";

export default function FindMentorPage() {
  const { token } = useAuth();
  const [viewMode, setViewMode] = useState("ai"); // 'ai' or 'search'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Manual Search Function
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Calls the User Search endpoint
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans text-slate-200">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto relative h-screen">
        {/* Ambient Background Effects */}
        <div className="fixed top-0 left-0 w-full h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* --- HEADER SECTION --- */}
          <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-400 mb-2">
                Find Your Mentor
              </h1>
              <p className="text-blue-300/60 font-mono text-sm tracking-wide">
                CONNECT • COLLABORATE • EVOLVE
              </p>
            </div>

            {/* View Toggle (Glassmorphism Pill) */}
            <div className="bg-[#0f172a]/80 p-1.5 rounded-xl flex border border-white/10 backdrop-blur-xl shadow-2xl">
                <button 
                    onClick={() => setViewMode("ai")}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                        viewMode === "ai" 
                        ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    AI Match
                </button>
                <button 
                    onClick={() => setViewMode("search")}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                        viewMode === "search" 
                        ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <span className="material-symbols-outlined text-lg">search</span>
                    Manual Search
                </button>
            </div>
          </header>

          {/* --- CONTENT AREA --- */}
          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
                
                {/* MODE 1: AI HOLOGRAPHIC DECK */}
                {viewMode === "ai" ? (
                    <motion.div 
                        key="deck"
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center justify-center pt-10"
                    >
                        <NeuralMatchDeck />
                    </motion.div>
                ) : (
                    
                /* MODE 2: MANUAL SEARCH GRID */
                    <motion.div 
                        key="search"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-10"
                    >
                        {/* Search Input Bar */}
                        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search developers by name, skill (e.g. React), or role..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-16 pl-16 pr-32 rounded-2xl bg-[#0B0F19] border border-white/10 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-600 font-medium shadow-2xl"
                                />
                                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-2xl group-hover:text-purple-400 transition-colors">search</span>
                                
                                <button 
                                    type="submit"
                                    disabled={isSearching}
                                    className="absolute right-2 top-2 bottom-2 px-8 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-purple-900/20"
                                >
                                    {isSearching ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : "Search"}
                                </button>
                            </div>
                        </form>

                        {/* Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map(user => (
                                <SearchResultCard key={user._id} user={user} />
                            ))}
                            
                            {!isSearching && searchResults.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-white/10 rounded-3xl bg-white/5">
                                    <span className="material-symbols-outlined text-6xl mb-4 opacity-30">travel_explore</span>
                                    <p className="text-lg font-medium">Enter a query above to explore the network.</p>
                                    <p className="text-sm opacity-50">Try searching for "Python", "Frontend", or specific names.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENT: Search Result Card ---
function SearchResultCard({ user }) {
    const navigate = useNavigate();

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, borderColor: "rgba(168,85,247,0.4)" }}
            className="bg-[#0f1629]/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl transition-all group cursor-pointer shadow-xl hover:shadow-purple-900/10"
        >
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                        <img 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff`} 
                            className="w-full h-full rounded-xl object-cover bg-[#0B0F19]" 
                            alt={user.username}
                        />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight group-hover:text-purple-300 transition-colors">{user.fullName}</h3>
                        <p className="text-gray-500 text-xs font-mono mt-1">@{user.username}</p>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md uppercase tracking-wider">
                    Lvl {user.level || 1}
                </span>
            </div>

            <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                {user.bio || "No bio provided. This developer is a mystery wrapped in code."}
            </p>

            <div className="space-y-3">
                <div className="flex flex-wrap gap-2 h-16 content-start overflow-hidden">
                    {user.skills?.slice(0, 4).map((s, i) => (
                        <span key={i} className="text-[10px] uppercase font-bold text-gray-300 bg-white/5 border border-white/5 px-2 py-1 rounded-md">
                            {s.name}
                        </span>
                    ))}
                    {(user.skills?.length > 4) && (
                        <span className="text-[10px] text-gray-500 px-1 py-1">+{user.skills.length - 4} more</span>
                    )}
                </div>

                <button onClick={() => navigate(`/user/${user._id}`)} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-purple-600 hover:border-purple-500 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg cursor-pointer">
                    <span>View Profile</span>
                    <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
            </div>
        </motion.div>
    );
}