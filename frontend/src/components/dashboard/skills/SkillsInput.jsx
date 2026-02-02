import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SkillsInput({ onAddSkill, isSaving, availableSkills = [] }) {
  const [query, setQuery] = useState("");
  const [proficiency, setProficiency] = useState("intermediate");
  const [isFocused, setIsFocused] = useState(false);

  // Autocomplete States
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedSkillData, setSelectedSkillData] = useState(null);

  const wrapperRef = useRef(null);
  const proficiencyLevels = ["beginner", "intermediate", "advanced", "expert"];

  // 1. Handle Click Outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Filter Suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    if (selectedSkillData && query === selectedSkillData.name) return;

    const filtered = availableSkills.filter(skill =>
      skill.name.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [query, availableSkills, selectedSkillData]);

  // 3. Handle Keyboard Navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (showSuggestions && highlightedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // 4. Select Suggestion Logic
  const selectSuggestion = (skill) => {
    setQuery(skill.name);
    setSelectedSkillData(skill);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  // 5. Submit Logic
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    let finalSkill = selectedSkillData;

    if (!finalSkill) {
      const match = availableSkills.find(s => s.name.toLowerCase() === query.trim().toLowerCase());
      if (match) {
        finalSkill = match;
      } else {
        finalSkill = {
          name: query.trim(),
          category: "General",
          logo: `https://cdn.simpleicons.org/${query.trim().replace(/\s|\./g, '').toLowerCase()}`,
          intensity: 50
        };
      }
    }

    const payload = {
      ...finalSkill,
      proficiencyLabel: proficiency,
      intensity: finalSkill.intensity || 50
    };

    if (typeof onAddSkill === 'function') {
      onAddSkill(payload);
    }

    setQuery("");
    setProficiency("intermediate");
    setSelectedSkillData(null);
    setSuggestions([]);
  };

  return (
    <motion.div
      layout
      ref={wrapperRef}
      className={`relative rounded-3xl transition-all duration-500 z-50 w-full
        ${isFocused
          ? "p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 shadow-[0_0_40px_rgba(59,130,246,0.2)] scale-[1.01]"
          : "p-[1px] bg-gray-200 dark:bg-white/10 shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:border-blue-400 dark:hover:border-blue-500/30 border border-transparent"
        }
      `}
    >
      <form
        onSubmit={handleSubmit}
        // ✅ CHANGED: Always 'flex-col' (Vertical Stack)
        className="relative bg-white dark:bg-[#0f1629]/80 backdrop-blur-xl rounded-[22px] p-5 lg:p-6 flex flex-col gap-4 transition-colors duration-500"
      >

        {/* === ROW 1: INPUT BAR === */}
        <div className="flex items-center gap-4 relative w-full">
          {/* Logo Preview */}
          <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-black/30 flex-shrink-0 flex items-center justify-center border transition-all duration-500
                ${selectedSkillData
              ? "border-blue-500 dark:border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
              : "border-gray-200 dark:border-white/10"
            }
             `}>
            {selectedSkillData ? (
              <img src={selectedSkillData.logo} alt="logo" className="w-7 h-7 object-contain drop-shadow-md" />
            ) : (
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-600 text-xl">code</span>
            )}
          </div>

          {/* Text Input - TAKES REMAINING SPACE */}
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedSkillData(null);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Type search (e.g. React)..."
              className="bg-transparent border-none text-gray-900 dark:text-white text-xl md:text-2xl font-black placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-bold focus:ring-0 w-full p-0 tracking-wide"
              autoComplete="off"
            />

            {/* --- AUTOCOMPLETE DROPDOWN --- */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border border-gray-200 dark:border-blue-500/20 rounded-xl shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto z-[100] custom-scrollbar py-2"
                >
                  {suggestions.map((skill, index) => (
                    <li
                      key={skill._id || index}
                      onMouseDown={() => selectSuggestion(skill)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
                            ${index === highlightedIndex
                          ? "bg-blue-50 dark:bg-blue-600/20 border-l-2 border-blue-500 pl-3"
                          : "hover:bg-gray-50 dark:hover:bg-white/5 border-l-2 border-transparent"}
                          `}
                    >
                      <img src={skill.logo} alt="" className="w-5 h-5 object-contain opacity-80" />
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white text-sm font-bold tracking-wide">{skill.name}</span>
                        <span className="text-[9px] text-blue-500 dark:text-blue-300/70 uppercase font-semibold">{skill.category}</span>
                      </div>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button - FIXED RIGHT */}
          <button
            type="submit"
            disabled={!query || isSaving}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex-shrink-0 flex items-center justify-center hover:from-blue-500 hover:to-blue-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:shadow-none shadow-lg shadow-blue-900/30 border border-blue-400/20"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-xl">add</span>
            )}
          </button>
        </div>

        {/* === ROW 2: PROFICIENCY (UNDER THE INPUT) === */}
        <div className="w-full pt-2 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap pt-1 sm:pt-0">
            Proficiency:
          </span>
          <div className="flex flex-wrap gap-2 w-full">
            {proficiencyLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setProficiency(level)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] uppercase font-black transition-all duration-300 relative overflow-hidden border border-gray-100 dark:border-white/5 
                            ${proficiency === level
                    ? "text-white bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)] border-transparent"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
              >
                <span className="relative z-10">{level}</span>
                {proficiency === level && (
                  <motion.div layoutId="activePill" className="absolute inset-0 bg-blue-600 -z-0" />
                )}
              </button>
            ))}
          </div>
        </div>

      </form>
    </motion.div>
  );
}