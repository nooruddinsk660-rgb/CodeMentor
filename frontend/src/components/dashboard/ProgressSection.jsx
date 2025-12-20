import React from "react";
import StatsCard from "./StatsCard";

export default function ProgressSection() {
  return (
    <>
      <h2 className="text-white text-[22px] font-bold leading-tight mb-4">Your Progress</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatsCard label="Experience Points (XP)" value="1,250" meta="+50 since last week" />
        <StatsCard label="Completed Sessions" value="18" meta="+2 this month" />
        <StatsCard label="Active Streak" value="12 Days" meta="Keep it up!" />
      </div>
    </>
  );
}
