import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subWeeks, eachDayOfInterval, startOfWeek, isSameDay, getMonth } from "date-fns";
import axios from "axios";
import { useAuth } from "../../auth/AuthContext";

/* ================= CONFIG ================= */
const CELL_SIZE_PX = 12;
const GAP_PX = 4;
const COL_WIDTH = CELL_SIZE_PX + GAP_PX;
const LEFT_AXIS_WIDTH = 30;

/* ================= UTILS (Non-Gamified Scale) ================= */
const getCellStyle = (intensity) => {
  switch (intensity) {
    case 0: return "bg-gray-100 dark:bg-[#0f1623] border border-gray-200 dark:border-white/5";
    case 1: return "bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50";
    case 2: return "bg-blue-300 dark:bg-blue-600/60 border border-blue-400 dark:border-blue-500/50 shadow-sm dark:shadow-[0_0_8px_rgba(37,99,235,0.4)]";
    case 3: return "bg-cyan-400 dark:bg-cyan-500/80 border border-cyan-500 dark:border-cyan-400/50 shadow-md dark:shadow-[0_0_12px_rgba(6,182,212,0.6)]";
    case 4: return "bg-white dark:bg-white border border-gray-300 dark:border-white shadow-lg dark:shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10";
    default: return "bg-gray-100 dark:bg-[#0f1623]";
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
        const availableWidth = width - LEFT_AXIS_WIDTH - 48;
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
    const alignedStart = startOfWeek(startDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: alignedStart, end: today });
  }, [weeksToShow]);

  /* ===== Month Labels ===== */
  const monthLabels = useMemo(() => {
    const labels = [];
    dateGrid.forEach((d, i) => {
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

  /* ===== Fetch Data (Memoized Lookup) ===== */
  const dataMap = useMemo(() => {
    const map = new Map();
    data.forEach(d => map.set(d.date, d));
    return map;
  }, [data]);

  const getDataForDate = useCallback((date) => {
    const key = format(date, "yyyy-MM-dd");
    return dataMap.get(key) || { count: 0, intensity: 0 };
  }, [dataMap]);

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

  // Derived Narrative
  const cadenceStatus = useMemo(() => {
    if (stats.streak > 14) return "Consistent Rhythm";
    if (stats.streak > 3) return "Establishing Pace";
    return "Irregular Cadence";
  }, [stats.streak]);

  return (
    <div
      ref={containerRef}
      className="w-full p-6 rounded-[32px] bg-white dark:bg-[#0A0F18] border border-gray-200 dark:border-white/5 shadow-2xl relative overflow-hidden flex flex-col"
    >
      {/* Ambience */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/5 blur-[100px] pointer-events-none" />

      {/* ===== HEADER (Narrative) ===== */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <h3 className="text-gray-900 dark:text-white font-extrabold tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">hub</span>
            NEURAL ACTIVITY
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${stats.streak > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'}`} />
            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">
              {cadenceStatus}
            </p>
          </div>
        </div>

        {/* Semantic Legend */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5">
          <span className="text-[9px] text-gray-500 font-bold tracking-wider">IDLE</span>
          {[0, 1, 2, 3, 4].map(l => (
            <div key={l} className={`w-2 h-2 rounded-sm ${getCellStyle(l).split(' ')[0]}`} />
          ))}
          <span className="text-[9px] text-gray-500 font-bold tracking-wider">PEAK</span>
        </div>
      </div>

      {/* ===== MATRIX ===== */}
      <div className="relative z-10 flex gap-4">

        {/* Left Axis */}
        <div className="grid grid-rows-7 gap-1 pt-[20px] text-[9px] font-mono text-gray-500 font-bold w-[24px] uppercase tracking-tighter">
          <span>Mon</span>
          <span className="invisible">Tue</span>
          <span>Wed</span>
          <span className="invisible">Thu</span>
          <span>Fri</span>
          <span className="invisible">Sat</span>
          <span>Sun</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Top Axis */}
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
          <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
            {dateGrid.map((date, i) => {
              const d = getDataForDate(date);
              const isToday = isSameDay(date, new Date());

              return (
                <motion.div
                  key={i}
                  onMouseEnter={(e) => setHovered({ ...d, date, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHovered(null)}
                  whileHover={{ scale: 1.2, zIndex: 50 }} // Reduced scale for stability
                  className={`
                    w-3 h-3 rounded-[2px] cursor-pointer relative transition-all duration-300
                    ${getCellStyle(d.intensity)}
                    ${isToday ? "ring-1 ring-blue-500 dark:ring-white/50 ring-dashed z-20" : ""} // Dashed = In Progress
                  `}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== TOOLTIP (Observational) ===== */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-xl border border-blue-500/20 dark:border-blue-500/30 rounded-lg p-3 shadow-2xl pointer-events-none min-w-[140px]"
            style={{ top: hovered.y - 90, left: hovered.x - 70 }}
          >
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-mono uppercase tracking-widest mb-1">
              {format(hovered.date, "MMM do, yyyy")}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${getCellStyle(hovered.intensity).split(' ')[0]}`} />
                <span className="text-gray-900 dark:text-white font-bold text-sm">{hovered.count} Ops</span>
              </div>
              {hovered.count > 0 && (
                <span className="text-[9px] text-blue-500 dark:text-blue-400 font-mono">Logged</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}