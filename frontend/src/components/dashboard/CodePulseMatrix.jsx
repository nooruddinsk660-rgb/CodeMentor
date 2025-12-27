import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  subWeeks,
  eachDayOfInterval,
  startOfWeek,
  isSameDay,
  getMonth
} from "date-fns";
import axios from "axios";
import { useAuth } from "../../auth/AuthContext";

/* ================= CONFIG ================= */
const CELL_SIZE_PX = 12; // w-3
const GAP_PX = 4;        // gap-1
const COL_WIDTH = CELL_SIZE_PX + GAP_PX; 
const LEFT_AXIS_WIDTH = 30; // Space for labels

/* ================= UTILS ================= */
const getCellStyle = (intensity) => {
  switch (intensity) {
    case 0: return "bg-[#0f1623] border border-white/5";
    case 1: return "bg-blue-900/40 border border-blue-800/50";
    case 2: return "bg-blue-600/60 border border-blue-500/50 shadow-[0_0_8px_rgba(37,99,235,0.4)]";
    case 3: return "bg-cyan-500/80 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.6)]";
    case 4: return "bg-white border border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110 z-10";
    default: return "bg-[#0f1623]";
  }
};

export default function CodePulseMatrix() {
  const { token } = useAuth();
  const containerRef = useRef(null);
  
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, streak: 0 });
  const [hovered, setHovered] = useState(null);
  const [weeksToShow, setWeeksToShow] = useState(20); 

  /* ===== Responsive Calculation ===== */
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const availableWidth = width - LEFT_AXIS_WIDTH - 48; // padding
        const cols = Math.floor(availableWidth / COL_WIDTH);
        setWeeksToShow(Math.max(cols, 10)); 
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /* ===== Date Grid (Monday Start) ===== */
  const dateGrid = useMemo(() => {
    const today = new Date();
    const startDate = subWeeks(today, weeksToShow - 1); 
    
    // Align to MONDAY ({ weekStartsOn: 1 })
    const alignedStart = startOfWeek(startDate, { weekStartsOn: 1 });
    
    return eachDayOfInterval({
      start: alignedStart,
      end: today
    });
  }, [weeksToShow]);

  /* ===== Month Labels ===== */
  const monthLabels = useMemo(() => {
    const labels = [];
    dateGrid.forEach((d, i) => {
      // Check first cell of each column (Index 0, 7, 14...)
      if (i % 7 === 0) {
        const curr = getMonth(d);
        const prev = i >= 7 ? getMonth(dateGrid[i - 7]) : -1;
        if (curr !== prev && i < dateGrid.length - 7) {
             labels.push({ text: format(d, "MMM"), col: i / 7 });
        }
      }
    });
    return labels;
  }, [dateGrid]);

  /* ===== Fetch Data ===== */
  useEffect(() => {
    if (!token) return;
    axios.get(`${import.meta.env.VITE_API_URL}/daily/briefing`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
        const matrix = res.data.data.matrix || [];
        setData(matrix);
        setStats({
          total: matrix.reduce((a, b) => a + b.count, 0),
          streak: res.data.data.streak || 0
        });
    })
    .catch(console.error);
  }, [token]);

  /* ===== Helpers ===== */
  const getDataForDate = (date) => {
    const key = format(date, "yyyy-MM-dd");
    return data.find((d) => d.date === key) || { count: 0, intensity: 0 };
  };

  return (
    <div 
      ref={containerRef}
      className="w-full p-6 rounded-[32px] bg-[#0A0F18] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/5 blur-[100px] pointer-events-none" />

      {/* ===== HEADER ===== */}
      <div className="relative z-10 flex justify-between items-end mb-6">
        <div>
          <h3 className="text-white font-extrabold tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">hub</span>
            NEURAL ACTIVITY
          </h3>
          <p className="text-gray-500 text-xs font-mono uppercase mt-1">
            {weeksToShow} Weeks • {stats.total} Contributions
          </p>
        </div>
        
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
             <span className="text-[10px] text-gray-500 font-bold">LOW</span>
             {[0,1,2,3,4].map(l => (
                 <div key={l} className={`w-2 h-2 rounded-sm ${getCellStyle(l).split(' ')[0]}`} />
             ))}
             <span className="text-[10px] text-gray-500 font-bold">HIGH</span>
        </div>
      </div>

      {/* ===== MATRIX ===== */}
      <div className="relative z-10 flex gap-4">
        
        {/* Left Axis: ALL DAYS (Mon-Sun) */}
        <div className="grid grid-rows-7 gap-1 pt-[20px] text-[9px] font-mono text-gray-500 font-bold w-[24px] uppercase tracking-tighter">
           <span className="flex items-center">Mon</span>
           <span className="flex items-center">Tue</span>
           <span className="flex items-center">Wed</span>
           <span className="flex items-center">Thu</span>
           <span className="flex items-center">Fri</span>
           <span className="flex items-center">Sat</span>
           <span className="flex items-center">Sun</span>
        </div>

        {/* Main Grid Area */}
        <div className="flex-1">
          
          {/* Top Axis: Months */}
          <div className="relative h-5 mb-1 w-full">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute text-[10px] text-gray-500 font-bold uppercase tracking-widest"
                style={{ left: `${m.col * COL_WIDTH}px` }}
              >
                {m.text}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div 
             className="grid grid-rows-7 grid-flow-col gap-1 w-max"
          >
            {dateGrid.map((date, i) => {
              const d = getDataForDate(date);
              const isToday = isSameDay(date, new Date());

              return (
                <motion.div
                  key={i}
                  onMouseEnter={(e) => setHovered({ ...d, date, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHovered(null)}
                  whileHover={{ scale: 1.5, zIndex: 50 }}
                  className={`
                    w-3 h-3 rounded-[2px] cursor-pointer relative transition-all duration-300
                    ${getCellStyle(d.intensity)}
                    ${isToday ? "ring-1 ring-white shadow-[0_0_10px_white] z-20" : ""}
                  `}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== TOOLTIP ===== */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-[#0b1220]/95 backdrop-blur-xl border border-blue-500/30 rounded-xl p-3 shadow-2xl pointer-events-none min-w-[120px]"
            style={{ top: hovered.y - 100, left: hovered.x - 60 }}
          >
            <p className="text-gray-400 text-[10px] font-mono uppercase">
               {format(hovered.date, "MMM do, yyyy")}
            </p>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getCellStyle(hovered.intensity).split(' ')[0]}`} />
                <span className="text-white font-black text-lg">{hovered.count} Ops</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}