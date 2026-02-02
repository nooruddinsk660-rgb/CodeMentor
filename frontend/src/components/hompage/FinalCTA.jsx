import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function FinalCTA() {
  const navigate = useNavigate();

  const handleJoin = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#60A5FA', '#34D399', '#A78BFA']
    });
    setTimeout(() => navigate('/signup'), 800);
  };

  return (
    <section className="relative py-32 flex items-center justify-center overflow-hidden">
      {/* Background with simple radial glow */}
      <div className="absolute inset-0 bg-[#030712]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#030712] to-[#030712]" />
      </div>

      <div className="relative z-10 text-center max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Initialize Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              Evolution.
            </span>
          </h2>

          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
            Stop guessing. Start engineering with data-driven precision.
          </p>

          <button
            onClick={handleJoin}
            className="group relative px-10 py-5 bg-white text-black font-black text-lg rounded-full overflow-hidden hover:scale-105 transition-transform shadow-[0_0_50px_rgba(34,211,238,0.6)] ring-4 ring-cyan-400/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              ENTER THE SYSTEM <span className="material-symbols-outlined">terminal</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
