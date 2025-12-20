import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="absolute top-4 right-4 text-sm font-medium text-slate-600 dark:text-slate-300"
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
