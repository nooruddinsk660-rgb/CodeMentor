// src/utils/sidebar.js
export function sidebarLinkClass(isActive) {
  return [
    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
    isActive ? "bg-primary/20 text-primary" : "text-gray-300 hover:bg-white/5"
  ].join(" ");
}

export const COLLAPSE_STORAGE_KEY = "orbitdev:sidebar_collapse_v1";

export function readCollapsedState() {
  try {
    const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeCollapsedState(state) {
  try {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(state));
  } catch { }
}
