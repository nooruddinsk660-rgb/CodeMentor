import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Terminal, Rocket } from "lucide-react";

export default function FinalCTA() {
  const navigate = useNavigate();

  const handleJoin = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#22d3ee', '#a855f7', '#3b82f6'],
      ticks: 200
    });
    setTimeout(() => navigate('/signup'), 800);
  };

  return (
    <section className="relative py-24 md:py-32 flex items-center justify-center overflow-hidden bg-[#030712] border-t border-white/5">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[#030712]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030712] to-[#030712]" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
      </div>

      <div className="relative z-10 text-center max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs md:text-sm font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            Waitlist Priority: High
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-[1] md:leading-[0.9]">
            Initialize Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
              Evolution.
            </span>
          </h2>

          <p className="text-gray-400 text-lg md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed text-balance">
            Stop guessing. Start engineering with data-driven precision.
            The system is ready. Are you?
          </p>

          <button
            onClick={handleJoin}
            className="group relative px-8 py-4 md:px-12 md:py-6 bg-white text-black font-black text-lg md:text-xl rounded-full overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_60px_rgba(34,211,238,0.4)] ring-4 ring-white/10 hover:ring-cyan-400/50"
          >
            <span className="relative z-10 flex items-center gap-3">
              INITIATE_LAUNCH
              <Rocket className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </span>
            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Scanline Effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
          </button>

          <div className="mt-8 text-gray-500 text-xs md:text-sm font-mono flex items-center justify-center gap-4">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Servers: ONLINE
            </span>
            <span>|</span>
            <span>v2.0.4 Stable</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
