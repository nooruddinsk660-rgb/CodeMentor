import React from 'react';

const TrajectoryCard = ({ intelligence }) => {
  const { trajectory, ai_analysis } = intelligence;
  
  const statusColors = {
    accelerating: "border-green-500 bg-green-500/10 text-green-400",
    stable: "border-blue-500 bg-blue-500/10 text-blue-400",
    drifting: "border-red-500 bg-red-500/10 text-red-400"
  };

  const theme = statusColors[trajectory] || statusColors.stable;

  return (
    <div className={`p-6 rounded-xl border ${theme} relative overflow-hidden`}>
      <div className="relative z-10">
        <h4 className="text-sm uppercase tracking-wider font-semibold opacity-80 mb-2">
          AI Career Trajectory
        </h4>
        <div className="text-2xl font-bold mb-3 capitalize">
          {trajectory} 🚀
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          "{ai_analysis}"
        </p>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl">
        📡
      </div>
    </div>
  );
};

export default TrajectoryCard;