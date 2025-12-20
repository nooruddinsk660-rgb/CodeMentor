export default function PageHeading() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
      <div>
        <p className="text-text-light-primary dark:text-text-dark-primary text-4xl font-black">
          GitHub Profile Analysis
        </p>
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          An overview of your coding activity and language distribution.
        </p>
      </div>

      <button className="h-10 px-4 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark font-bold text-text-light-primary dark:text-text-dark-primary hover:bg-black/5 dark:hover:bg-white/5">
        Refresh Data
      </button>
    </div>
  );
}
