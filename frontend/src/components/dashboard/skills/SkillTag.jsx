import React from "react";

export default function SkillTag({ name, onRemove }) {
  return (
    <div className="flex h-9 items-center gap-x-2 rounded-full bg-primary/10 dark:bg-primary/20 pl-4 pr-2 group">
      <p className="text-primary dark:text-blue-300 text-sm font-medium">{name}</p>
      <button
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="flex items-center justify-center w-7 h-7 rounded-full text-primary/70 dark:text-blue-300/70 hover:bg-primary/20 dark:hover:bg-primary/30 hover:text-primary dark:hover:text-blue-200"
        type="button"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}
