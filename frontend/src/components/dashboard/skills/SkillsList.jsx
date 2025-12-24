import React from "react";
import { AnimatePresence } from "framer-motion";
import SkillTag from "./SkillTag"; // Import the new component

export default function SkillsList({ skills, onRemove }) {
  if (!skills || skills.length === 0) {
     return (
        <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center">
            <p className="text-gray-500 text-sm">System Empty. Add a skill to initialize.</p>
        </div>
     );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <AnimatePresence mode="popLayout">
        {skills.map((skill) => (
          <SkillTag 
            key={skill.name} 
            skill={skill} 
            onRemove={onRemove} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}