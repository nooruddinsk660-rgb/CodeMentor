import React from "react";

export default function MentorCard({
  avatar,
  name,
  role,
  onViewProfile,
}) {
  return (
    <div
      className="
        group flex items-center gap-4 p-4
        rounded-xl border
        bg-white/5 border-white/10
        dark:bg-gray-900/50 dark:border-gray-800
        transition-all duration-200
        hover:bg-white/10 hover:border-white/20
      "
    >
      {/* Avatar */}
      <div className="relative w-12 h-12 shrink-0">
        <img
          src={avatar}
          alt={`${name} profile`}
          className="w-full h-full rounded-full object-cover border border-white/20"
          onError={(e) => {
            e.currentTarget.src = "/default-avatar.png";
          }}
        />
      </div>

      {/* Mentor Info */}
      <div className="flex-grow min-w-0">
        <p className="text-white font-semibold truncate">
          {name}
        </p>
        <p className="text-sm text-gray-400 truncate">
          {role}
        </p>
      </div>

      {/* Action */}
      <button
        onClick={onViewProfile}
        className="
          px-4 py-2 text-sm font-medium rounded-lg
          text-white bg-primary
          transition-colors duration-200
          hover:bg-primary/90
          focus:outline-none focus:ring-2 focus:ring-primary/40
        "
      >
        Profile
      </button>
    </div>
  );
}
