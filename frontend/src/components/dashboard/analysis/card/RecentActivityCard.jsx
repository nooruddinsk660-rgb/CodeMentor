export default function RecentActivityCard() {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6">
      <h2 className="text-[22px] font-bold text-text-light-primary dark:text-text-dark-primary mb-6">
        Recent Repository Activity
      </h2>

      <div className="flex flex-col gap-4">

        {/* Example row */}
        {[
          ["personal-portfolio-v2", "My updated professional portfolio website.", "#10b981"],
          ["project-phoenix", "A collaborative full-stack application.", "#f59e0b"],
          ["data-viz-library", "Custom charting components with React.", "#6366f1"],
          ["dotfiles", "My personal development environment setup.", "#ec4899"]
        ].map(([name, desc, color]) => (
          <div
            key={name}
            className="flex items-center justify-between gap-4 border-b border-border-light dark:border-border-dark pb-4 last:border-none last:pb-0"
          >
            <div className="flex flex-col">
              <a className="font-semibold hover:text-primary">{name}</a>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">{desc}</p>
            </div>

            <div className="w-24 h-8 flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 30">
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  points="0,20 10,15 20,25 30,10 40,18 50,12 60,22 70,5 80,15 90,20 100,25"
                ></polyline>
              </svg>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
