import React from "react";

export default function StatsCard({ label, value, meta }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white/5 border border-white/10 dark:bg-gray-900/50 dark:border-gray-800">
      <p className="text-gray-300 text-base font-medium">{label}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
      {meta && <p className="text-green-400 text-base font-medium">{meta}</p>}
    </div>
  );
}
