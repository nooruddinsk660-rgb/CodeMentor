import React, { useState, useEffect } from "react";

/**
 * SkillsInput
 * - local state for the input
 * - reads/writes the shared skills list from localStorage
 * - prevents duplicates
 * - fires 'custom' event to let SkillsList know about updates
 *
 * Implementation detail:
 * This file uses a simple pub/sub pattern via the DOM CustomEvent to avoid
 * introducing a global state library. If you prefer, swap to context or Redux.
 */

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

function writeStoredSkills(skills) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
  } catch (e) {
    // ignore storage errors
  }
}

export default function SkillsInput() {
  const [value, setValue] = useState("");
  const [skills, setSkills] = useState(() => readStoredSkills());
  const [error, setError] = useState("");

  useEffect(() => {
    // initialize
    writeStoredSkills(skills);
    // notify other components
    window.dispatchEvent(new CustomEvent("skills:update", { detail: { skills } }));
  }, [skills]);

  const normalize = (s) => s.trim();

  function addSkill(raw) {
    const candidate = normalize(raw);
    if (!candidate) {
      setError("");
      return;
    }

    // case-insensitive duplicate prevention
    const exists = skills.some((x) => x.toLowerCase() === candidate.toLowerCase());
    if (exists) {
      setError(`${candidate} is already added.`);
      // clear after short delay
      setTimeout(() => setError(""), 2000);
      return;
    }

    const next = [...skills, candidate];
    setSkills(next);
    setValue("");
    setError("");
    writeStoredSkills(next);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(value);
    }
    // optionally allow comma to add multiple
    if (e.key === "," && value.trim()) {
      e.preventDefault();
      addSkill(value.replace(",", ""));
    }
  }

  function handleClickAdd() {
    addSkill(value);
  }

  return (
    <div className="bg-white dark:bg-[#1b2027] rounded-xl shadow-sm border border-gray-200 dark:border-[#3b4454] p-6">
      <label className="flex flex-col w-full">
        <p className="text-black dark:text-white text-base font-medium leading-normal pb-2">Add a skill</p>

        <div className="flex w-full items-stretch rounded-lg group">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill and press Enter"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-background-dark border border-gray-300 dark:border-[#3b4454] bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-400 dark:placeholder:text-[#9ca7ba] px-4 text-base"
            aria-label="Add skill"
          />

          <button
            onClick={handleClickAdd}
            aria-label="Add skill"
            className="text-white bg-primary flex border border-primary items-center justify-center px-4 rounded-r-lg"
            type="button"
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
        </div>
      </label>

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

      <div className="flex justify-end pt-4">
        <button
          onClick={() => {
            // Save explicitly (already saved on change, but keep for parity with original UI)
            writeStoredSkills(skills);
            // Small visual confirmation — temporarily change text? here we'll dispatch event
            window.dispatchEvent(new CustomEvent("skills:saved", { detail: { skills } }));
            const el = document.createElement("div");
            el.textContent = "Saved";
            // no-op UX feedback; real app would show a toast
          }}
          className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center rounded-lg h-12 px-8 bg-primary text-white text-base font-bold tracking-[0.015em] hover:bg-blue-600 transition-colors"
        >
          <span className="truncate">Save Changes</span>
        </button>
      </div>
    </div>
  );
}
