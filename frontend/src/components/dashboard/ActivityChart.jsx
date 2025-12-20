import React from "react";

/* Lightweight SVG area chart placeholder; replace with charting lib if required */
export default function ActivityChart() {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 dark:bg-gray-900/50 dark:border-gray-800">
      <div className="w-full h-64 flex items-end justify-center bg-transparent relative chart-placeholder">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 256" aria-hidden>
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1c6bf2" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1c6bf2" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d="M0,150 C30,120 70,180 100,160 S160,100 190,120 S250,200 280,180 S340,110 370,130 S430,190 460,170 S520,100 550,120 L600,256 L0,256 Z"
            fill="url(#chartGradient)" transform="scale(1,1)"/>
          <path d="M0,150 C30,120 70,180 100,160 S160,100 190,120 S250,200 280,180 S340,110 370,130 S430,190 460,170 S520,100 550,120" fill="none" stroke="#1c6bf2" strokeWidth="2" />
        </svg>
        <p className="absolute inset-0 flex items-center justify-center text-gray-400">GitHub commit activity chart</p>
      </div>
    </div>
  );
}
