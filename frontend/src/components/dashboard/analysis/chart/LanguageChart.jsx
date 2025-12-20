export default function LanguageChart() {
  return (
    <div className="relative w-full max-w-[280px] aspect-square">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="15.9154943092"
          fill="none"
          stroke="#6366f1"
          strokeWidth="3.8"
        ></circle>

        <circle
          cx="18"
          cy="18"
          r="15.9154943092"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="3.8"
          strokeDasharray="45, 100"
          strokeDashoffset="0"
        ></circle>

        <circle
          cx="18"
          cy="18"
          r="15.9154943092"
          fill="none"
          stroke="#ec4899"
          strokeWidth="3.8"
          strokeDasharray="30, 100"
          strokeDashoffset="-45"
        ></circle>

        <circle
          cx="18"
          cy="18"
          r="15.9154943092"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3.8"
          strokeDasharray="15, 100"
          strokeDashoffset="-75"
        ></circle>

        <circle
          cx="18"
          cy="18"
          r="15.9154943092"
          fill="none"
          stroke="#10b981"
          strokeWidth="3.8"
          strokeDasharray="5, 100"
          strokeDashoffset="-90"
        ></circle>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-text-light-primary dark:text-text-dark-primary">
          100%
        </span>
        <span className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
          Total
        </span>
      </div>
    </div>
  );
}
