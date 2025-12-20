import LanguageChart from "../chart/LanguageChart";

export default function LanguageDistributionCard() {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6">

      <h2 className="text-[22px] font-bold text-text-light-primary dark:text-text-dark-primary">
        Primary Language Distribution
      </h2>

      <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1 mb-6">
        This chart visualizes the distribution of programming languages across your public repositories.
      </p>

      <div className="flex flex-col md:flex-row items-center gap-8">

        {/* Extracted Chart */}
        <LanguageChart />

        {/* Legend */}
        <div className="w-full flex-1">
          <ul className="space-y-3">
            {/* unchanged */}
          </ul>
        </div>
      </div>
    </div>
  );
}
