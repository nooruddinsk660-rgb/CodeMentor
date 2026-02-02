import React, { useMemo } from "react";

export default function LanguageDistributionCard({ data, loading }) {
  
  // --- CHART MATH ---
  const chartData = useMemo(() => {
      if (!data) return [];
      const total = Object.values(data).reduce((a, b) => a + b, 0);
      let currentOffset = 0;
      
      return Object.entries(data).map(([lang, count], index) => {
          const percent = (count / total) * 100;
          const offset = currentOffset;
          currentOffset += percent;
          return { lang, percent, offset, color: getColor(index) };
      });
  }, [data]);

  if (loading) return <div className="h-96 w-full bg-[#0B0F19] rounded-2xl animate-pulse border border-white/5" />;

  return (
    <div className="bg-[#0B0F19] rounded-2xl border border-white/5 p-8 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white">Language Composition</h2>
        <p className="text-gray-500 text-xs mt-1">
           Code volume breakdown by primary technology.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12 flex-1">
        
        {/* SVG DONUT CHART */}
        <div className="relative w-48 h-48 flex-shrink-0">
           <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              {chartData.map((slice) => (
                 <circle
                    key={slice.lang}
                    cx="18" cy="18" r="15.915"
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="3"
                    strokeDasharray={`${slice.percent} ${100 - slice.percent}`}
                    strokeDashoffset={-slice.offset}
                    className="transition-all duration-1000 ease-out"
                 />
              ))}
           </svg>
           {/* Center Hole Text */}
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">100%</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Analyzed</span>
           </div>
        </div>

        {/* LEGEND */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
           {chartData.map((slice) => (
              <div key={slice.lang} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                 <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="text-sm font-bold text-gray-200">{slice.lang}</span>
                 </div>
                 <span className="text-xs font-mono text-gray-500">{Math.round(slice.percent)}%</span>
              </div>
           ))}
        </div>

      </div>
      
      <div className="mt-8 pt-4 border-t border-white/5 text-center">
         <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
            * Data based on public repository bytes
         </p>
      </div>
    </div>
  );
}

function getColor(index) {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1"];
    return colors[index % colors.length];
}