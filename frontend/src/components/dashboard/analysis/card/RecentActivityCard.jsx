import React from "react";

export default function RecentActivityCard({ data, loading }) {
  
  if (loading) return <div className="h-96 w-full bg-[#0B0F19] rounded-2xl animate-pulse border border-white/5" />;

  return (
    <div className="bg-[#0B0F19] rounded-2xl border border-white/5 p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Recent Activity</h2>
        <p className="text-gray-500 text-xs mt-1">
           Latest detected repository updates.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {data?.map((repo, i) => (
           <div key={i} className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors flex items-center justify-between gap-4">
              
              <div>
                 <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {repo.name}
                 </h4>
                 <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {repo.desc}
                 </p>
              </div>

              <div className="text-right">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getLangStyle(repo.lang)}`}>
                    {repo.lang}
                 </span>
              </div>

           </div>
        ))}
      </div>
      
      {/* Footer / Context */}
      <div className="mt-6 text-center">
         <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
            VIEW FULL LOG →
         </button>
      </div>
    </div>
  );
}

function getLangStyle(lang) {
    switch (lang) {
        case "Rust": return "text-orange-400 border-orange-400/20 bg-orange-400/10";
        case "TypeScript": return "text-blue-400 border-blue-400/20 bg-blue-400/10";
        case "Python": return "text-yellow-400 border-yellow-400/20 bg-yellow-400/10";
        default: return "text-gray-400 border-gray-400/20 bg-gray-400/10";
    }
}