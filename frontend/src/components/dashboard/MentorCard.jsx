import React, { memo } from "react";

const MentorCard = memo(({
  avatar,
  name,
  role,
  matchReason = "High Synergy", // New context slot (default for now)
  onViewProfile,
}) => {
  return (
    <div
      className="
        group relative flex items-center gap-4 p-4
        rounded-2xl border border-white/5
        bg-[#0B0F19] 
        transition-all duration-300
        hover:border-white/10 hover:bg-white/[0.02]
      "
    >
      {/* 1. IDENTITY CUE (Avatar) */}
      <div className="relative w-12 h-12 shrink-0">
        <img
          src={avatar}
          alt=""
          className="
            w-full h-full rounded-full object-cover 
            border border-white/10 
            transition-all duration-300
            group-hover:border-white/30 group-hover:scale-105
          "
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${name}&background=1e293b&color=fff`;
          }}
        />
        {/* Subtle Status Dot (Optional context signal) */}
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B0F19] rounded-full" />
      </div>

      {/* 2. HIERARCHY STACK */}
      <div className="flex-grow min-w-0 flex flex-col justify-center">
        
        {/* Primary: Name */}
        <h4 className="text-gray-200 font-bold text-sm truncate transition-colors group-hover:text-white">
          {name}
        </h4>

        {/* Secondary: Role */}
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {role}
        </p>
        
        {/* Tertiary: Context Signal (The "Why") */}
        <p className="text-[10px] font-mono text-blue-400/80 uppercase tracking-wide mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {matchReason}
        </p>
      </div>

      {/* 3. EXPLORATORY ACTION (Soft Button) */}
      <button
        onClick={onViewProfile}
        aria-label={`View profile of ${name}`}
        className="
          px-4 py-2 text-xs font-semibold rounded-lg
          text-gray-400 border border-white/5
          bg-transparent
          transition-all duration-200
          hover:text-white hover:border-white/20 hover:bg-white/5
          focus:outline-none focus:ring-1 focus:ring-white/20
        "
      >
        View
      </button>
    </div>
  );
});

export default MentorCard;