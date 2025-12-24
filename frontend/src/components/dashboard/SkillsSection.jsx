import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import SkillsInput from "./skills/SkillsInput"; 

/* --- 1. THE PARTICLE BACKGROUND COMPONENT --- */
const ParticleNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    
    const resize = () => {
      // Check if canvas exists before resizing
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", resize);
    resize();

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2,
    }));

    const draw = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(100, 200, 255, 0.1)";
      ctx.strokeStyle = "rgba(100, 200, 255, 0.05)";

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

/* --- 2. THE 3D TILT CARD (Wrapped in forwardRef for Animation) --- */
const HolographicCard = React.forwardRef(({ skill, onClick, isSelected, onRemove }, ref) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const gradient = skill.colorGradient || "from-blue-400 to-purple-600";

  return (
    <motion.div
      ref={ref} // <--- Important for AnimatePresence
      layout
      onClick={onClick}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative h-32 w-full rounded-xl border border-white/10 bg-gray-900/50 cursor-pointer overflow-hidden transition-all duration-500
        ${isSelected ? "ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]" : "hover:border-white/30"}
      `}
    >
      {/* --- CLEAN SVG DELETE BUTTON --- */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); 
          onRemove(skill.name);
        }}
        className="absolute top-2 right-2 z-20 w-6 h-6 flex items-center justify-center rounded-full 
                   bg-white/5 text-gray-400 border border-white/10 backdrop-blur-md
                   hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] 
                   transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110"
        title="Remove Skill"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 p-4">
        <div className={`p-3 rounded-full bg-white/5 transition-transform duration-500 group-hover:rotate-[360deg] group-hover:bg-white/10 ${isSelected ? 'bg-blue-500/20' : ''}`}>
           <img 
             src={skill.logo} 
             alt={skill.name} 
             className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
           />
        </div>
        <div className="text-center w-full px-2">
            <h4 className="text-white font-bold text-sm tracking-wide group-hover:text-blue-200 transition-colors truncate">{skill.name}</h4>
            <div className="mt-2 h-1 w-16 bg-gray-700 rounded-full overflow-hidden mx-auto">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.intensity}%` }}
                    className={`h-full bg-gradient-to-r ${gradient}`} 
                />
            </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/20 transition-all group-hover:w-full group-hover:h-full group-hover:border-blue-500/30 rounded-tl-xl" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/20 transition-all group-hover:w-full group-hover:h-full group-hover:border-blue-500/30 rounded-br-xl" />
    </motion.div>
  );
});

/* --- 3. MAIN COMPONENT (Cleaned - Receives Data via Props) --- */
export default function SkillsSection({ 
    userSkills = [], 
    availableSkills = [], // Master list passed from parent
    onAddSkill, 
    onRemoveSkill, 
    isSaving 
}) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filter, setFilter] = useState("All");

  // Calculate categories from props
  const categories = useMemo(() => ["All", ...new Set(userSkills.map(s => s.category))], [userSkills]);
  
  // Filter logic
  const filteredSkills = useMemo(() => {
    if (filter === "All") return userSkills;
    return userSkills.filter(s => s.category === filter);
  }, [userSkills, filter]);

  return (
    <div className="relative w-full min-h-[600px] bg-[#030712] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col">
      
      <ParticleNetwork />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-8 md:p-12 flex-1">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-400 mb-2">
              Tech Arsenal
            </h2>
            <p className="text-gray-400">Interactive proficiency matrix & stack visualization.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 
                  ${filter === cat 
                    ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:bg-white/10"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form - Uses Master List for Auto-complete */}
        <div className="mb-10">
            <SkillsInput 
                onAddSkill={onAddSkill} 
                isSaving={isSaving} 
                availableSkills={availableSkills} 
            />
        </div>

        {/* Grid of Cards */}
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
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 p-6 md:p-0 md:static md:mt-12"
            >
              <div className="bg-[#0f1629]/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
                <button onClick={() => setSelectedSkill(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                   <img src={selectedSkill.logo} alt={selectedSkill.name} className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                   <div className="absolute inset-0 bg-blue-500/20 blur-xl -z-10" />
                </div>

                <div className="flex-1 w-full text-center md:text-left">
                  <h3 className="text-3xl font-black text-white mb-2">{selectedSkill.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                    <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-bold uppercase">{selectedSkill.category}</span>
                    <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold uppercase">Proficiency: {selectedSkill.intensity}%</span>
                  </div>
                  
                  <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden relative">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedSkill.intensity}%` }}
                        transition={{ duration: 1, type: "spring" }}
                        className={`h-full bg-gradient-to-r ${selectedSkill.colorGradient || "from-blue-400 to-purple-600"} relative`}
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_white]" />
                    </motion.div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
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