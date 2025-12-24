import React, { useRef, useState } from "react";
import CountUp from "react-countup";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function StatsCard({ label, value, meta, icon: Icon, color = "blue", delay = 0 }) {
  const ref = useRef(null);

  // Mouse tracking logic for Spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D Tilt logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    
    // Spotlight coordinates
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);

    // Tilt coordinates
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    rotateX.set(yPct * -10); // Max tilt deg
    rotateY.set(xPct * 10);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    rotateX.set(0);
    rotateY.set(0);
  }

  // Dynamic Styles
  const colorStyles = {
    blue: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-blue-500/30",
    purple: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    orange: "from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30",
    green: "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl p-6 border transition-all duration-300",
        "bg-gray-900/40 backdrop-blur-xl hover:shadow-2xl hover:shadow-black/50",
        colorStyles[color].split(" ")[2] // Apply border color
      )}
    >
      {/* Spotlight Effect Layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* Background Gradient Mesh */}
      <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100", colorStyles[color].split(" ").slice(0, 2).join(" "))} />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className={cn("p-2 rounded-lg bg-white/5 w-fit", colorStyles[color].split(" ")[2].replace('text', 'bg').replace('400', '500/10'))}>
          {Icon && <Icon size={24} className={colorStyles[color].split(" ")[2]} />}
        </div>
        {/* Decorative mini-sparkline/dots */}
        <div className="flex gap-1">
          {[1,2,3].map(i => <div key={i} className={`w-1 h-1 rounded-full ${colorStyles[color].split(" ")[2]} opacity-${i*30}`} />)}
        </div>
      </div>

      <div className="relative z-10 mt-2">
        <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-white text-4xl font-black tracking-tight">
            <CountUp end={Number(value)} duration={2.5} separator="," />
          </span>
        </div>
        
        {meta && (
          <div className="mt-3 flex items-center gap-2">
             <div className={cn("h-px flex-1 bg-gradient-to-r from-transparent to-transparent", colorStyles[color].split(" ")[2].replace("text", "via"))} />
             <p className={cn("text-xs font-bold uppercase tracking-wider", colorStyles[color].split(" ")[2])}>
              {meta}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}