import React from "react";

export default function MentorCard({ avatar, name, role }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 dark:bg-gray-900/50 dark:border-gray-800">
      <div className="w-12 h-12 rounded-full avatar" style={{ backgroundImage: `url(${avatar})` }} />
      <div className="flex-grow">
        <p className="text-white font-semibold">{name}</p>
        <p className="text-sm text-gray-400">{role}</p>
      </div>
      <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg">Profile</button>
    </div>
  );
}
