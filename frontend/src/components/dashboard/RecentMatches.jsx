import React, { useEffect, useState } from "react";
import MentorCard from "./MentorCard";
import { getRecommendedMatches } from "../../services/match.service";
import { useAuth } from "../../auth/AuthContext";

export default function RecentMatches() {
  const { token, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    async function fetchMatches() {
      try {
        const data = await getRecommendedMatches(token);
        setMatches(data);
      } catch (err) {
        console.error("Recent matches error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [token, authLoading]);

  if (authLoading || loading) {
    return <p className="text-gray-400">Loading matches…</p>;
  }

  return (
    <div>
      <h3 className="text-white text-[22px] font-bold mb-4">
        Recommended Matches
      </h3>

      <div className="space-y-4">
        {matches.map((user) => (
          <MentorCard
            key={user._id}
            avatar={user.avatar}
            name={user.fullName}
            role={user.primarySkill || "Mentor"}
          />
        ))}
      </div>
    </div>
  );
}
