import React, { useState, useMemo, useRef, useEffect, memo, forwardRef } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import SkillsInput from "./skills/SkillsInput";

/* --- 1. GOVERNED PARTICLE NETWORK --- */
const ParticleNetwork = memo(({ paused }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Guard clause

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    const init = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2,
      }));
    };

    const draw = (mouseX, mouseY) => {
      if (!canvas || paused) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Determine Theme (Check if 'dark' class is present on html)
      const isDark = document.documentElement.classList.contains("dark");

      const particleColor = isDark ? "rgba(56, 189, 248, 0.1)" : "rgba(79, 70, 229, 0.1)"; // Cyan vs Indigo
      const lineColor = isDark ? "rgba(56, 189, 248, 0.05)" : "rgba(79, 70, 229, 0.05)";

      ctx.fillStyle = particleColor;
      ctx.strokeStyle = lineColor;

      particles.forEach((p, i) => {
        // Simple Physics
        p.x += p.vx;
        p.y += p.vy;

        // Mouse Interaction (Repulsion)
        if (mouseX && mouseY) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const angle = Math.atan2(dy, dx);
            const force = (100 - dist) / 100;
            p.vx += Math.cos(angle) * force * 0.5;
            p.vy += Math.sin(angle) * force * 0.5;
          }
        }

        // Friction to stabilize
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
      animationFrameId = requestAnimationFrame(() => draw(mouseX, mouseY));
    };

    init();

    // Track mouse for canvas interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    draw(0, 0); // Start loop

    window.addEventListener("resize", init);

    return () => {
      window.removeEventListener("resize", init);
      canvas.removeEventListener('mousemove', handleMouseMove); // Cleanup
      cancelAnimationFrame(animationFrameId);
    };
  }, [paused]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-30" />;
});

/* --- 2. HOLOGRAPHIC IDENTITY CARD (Fixed with forwardRef) --- */
// ✅ FIX: Added forwardRef here so AnimatePresence can measure the element
const HolographicCard = memo(forwardRef(({ skill, onClick, isSelected, onRemove }, ref) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const gradient = skill.colorGradient || "from-blue-500 to-cyan-400";

  return (
    <motion.div
      ref={ref} // ✅ FIX: Passed the ref to the motion component
      layout
      onClick={onClick}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative h-36 w-full rounded-2xl border bg-white dark:bg-[#0B0F19] cursor-pointer overflow-hidden transition-all duration-300
        ${isSelected
          ? "border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.2)]"
          : "border-gray-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-white/20 shadow-sm dark:shadow-none hover:shadow-md"
        }
      `}
    >
      {/* Remove Action */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(skill.name); }}
        className="absolute top-2 right-2 z-20 w-6 h-6 flex items-center justify-center rounded-full 
                   bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 
                   transition-all opacity-0 group-hover:opacity-100"
        title="Archive Skill"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>

      {/* Holographic Shine */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(56, 189, 248, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 p-4">
        <div className={`p-3 rounded-xl bg-gray-50 dark:bg-white/5 transition-colors duration-300 group-hover:bg-white/20 dark:group-hover:bg-white/10 ${isSelected ? 'bg-blue-500/10' : ''}`}>
          <img
            src={skill.logo}
            alt={skill.name}
            className="w-8 h-8 object-contain drop-shadow-lg"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>

        <div className="text-center w-full px-1">
          <h4 className="text-gray-900 dark:text-white font-bold text-sm tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-100 transition-colors truncate">
            {skill.name}
          </h4>

          <div className="mt-2 h-1 w-12 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mx-auto">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${skill.intensity}%` }}
              className={`h-full bg-gradient-to-r ${gradient}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}));

/* --- 3. MAIN INTERFACE --- */
export default function SkillsSection({
  userSkills = [],
  availableSkills = [],
  onAddSkill,
  onRemoveSkill,
  isSaving
}) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filter, setFilter] = useState("All");

  const categories = useMemo(() => {
    const counts = userSkills.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});
    return ["All", ...Object.keys(counts).sort((a, b) => counts[b] - counts[a])];
  }, [userSkills]);

  const filteredSkills = useMemo(() => {
    if (filter === "All") return userSkills;
    return userSkills.filter(s => s.category === filter);
  }, [userSkills, filter]);

  const getProficiencyLabel = (val) => {
    if (val > 80) return "Mastery Phase";
    if (val > 50) return "Active Proficiency";
    return "Emerging Capability";
  };

  return (
    <div className="relative w-full min-h-[600px] bg-white dark:bg-[#030712] rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/5 shadow-xl dark:shadow-2xl flex flex-col transition-colors duration-500">

      <ParticleNetwork paused={!!selectedSkill} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-8 md:p-10 flex-1">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              Tech Arsenal
            </h2>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>Current operational capabilities</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 
                  ${filter === cat
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="mb-10">
          <SkillsInput
            onAddSkill={onAddSkill}
            isSaving={isSaving}
            availableSkills={availableSkills}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, index) => (
              <HolographicCard
                key={skill._id || skill.name || index}
                skill={skill}
                isSelected={selectedSkill?.name === skill.name}
                onClick={() => setSelectedSkill(skill)}
                onRemove={onRemoveSkill}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedSkill && (
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-6 left-6 right-6 md:absolute md:bottom-8 md:left-8 md:right-8 z-50"
            >
              <div className="bg-white/95 dark:bg-[#0f1629]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden transition-colors">
                <button onClick={() => setSelectedSkill(null)} className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>

                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                  <img src={selectedSkill.logo} alt="" className="w-12 h-12 object-contain" />
                </div>

                <div className="flex-1 w-full text-center md:text-left">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{selectedSkill.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider">
                      {selectedSkill.category}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                      {getProficiencyLabel(selectedSkill.intensity)}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-widest">
                      <span>Initiate</span>
                      <span>Master</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedSkill.intensity}%` }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className={`h-full bg-gradient-to-r ${selectedSkill.colorGradient || "from-blue-500 to-indigo-500"}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}