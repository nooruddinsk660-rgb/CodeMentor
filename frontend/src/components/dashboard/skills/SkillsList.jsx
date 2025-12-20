import React, { useEffect, useState } from "react";
import SkillTag from "./SkillTag";

const STORAGE_KEY = "codementor:user_skills_v1";

function readStoredSkills() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function SkillsList() {
  const [skills, setSkills] = useState(() => readStoredSkills());

  useEffect(() => {
    function onUpdate(e) {
      setSkills(e.detail?.skills ?? readStoredSkills());
    }
    // Listen for updates from SkillsInput (or other pages)
    window.addEventListener("skills:update", onUpdate);
    // Also allow explicit saved event
    window.addEventListener("skills:saved", onUpdate);

    return () => {
      window.removeEventListener("skills:update", onUpdate);
      window.removeEventListener("skills:saved", onUpdate);
    };
  }, []);

  function removeSkill(name) {
    const next = skills.filter((s) => s.toLowerCase() !== name.toLowerCase());
    setSkills(next);
    try {
      localStorage.setItem("codementor:user_skills_v1", JSON.stringify(next));
    } catch {}
    // notify other components
    window.dispatchEvent(new CustomEvent("skills:update", { detail: { skills: next } }));
  }

  if (!skills || skills.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 dark:bg-gray-900/50 dark:border-gray-800">
        <p className="text-gray-400">No skills added yet. Add a skill above to get started.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 dark:bg-gray-900/50 dark:border-gray-800">
      <div className="flex flex-wrap gap-3">
        {skills.map((s) => (
          <SkillTag key={s} name={s} onRemove={() => removeSkill(s)} />
        ))}
      </div>
    </div>
  );
}
