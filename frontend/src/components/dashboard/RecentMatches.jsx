import React from "react";
import MentorCard from "./MentorCard";

const mentors = [
  { avatar: "https://i.pravatar.cc/100?img=32", name: "Jane Doe", role: "Python Expert" },
  { avatar: "https://i.pravatar.cc/100?img=33", name: "John Smith", role: "React Specialist" },
  { avatar: "https://i.pravatar.cc/100?img=34", name: "Emily White", role: "Data Science Pro" }
];

export default function RecentMatches() {
  return (
    <div>
      <h3 className="text-white text-[22px] font-bold mb-4">Recent Matches</h3>
      <div className="space-y-4">
        {mentors.map((m) => (
          <MentorCard key={m.name} {...m} />
        ))}
      </div>
    </div>
  );
}
