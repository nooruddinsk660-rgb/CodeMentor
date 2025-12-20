import React from "react";

/**
 * Simple section header for the Skills page.
 * Kept intentionally lightweight to fit the dashboard layout.
 */
export default function SkillsHeader() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
        My Technical Skills
      </h1>
      <p className="text-gray-400 dark:text-[#9ca7ba] text-base">
        Add or remove skills so the platform can match you to the right mentors.
      </p>
    </header>
  );
}
