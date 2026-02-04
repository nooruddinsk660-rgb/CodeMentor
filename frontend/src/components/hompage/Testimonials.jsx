import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Engineer @ Google",
    text: "The AI mentorship is uncannily accurate. It caught a race condition my team missed.",
    avatar: "https://i.pravatar.cc/100?img=5"
  },
  {
    name: "Michael Ross",
    role: "Frontend Lead @ Vercel",
    text: "Finally, a learning platform that understands system design, not just syntax.",
    avatar: "https://i.pravatar.cc/100?img=11"
  },
  {
    name: "Jessica Wu",
    role: "CTO @ StartupFlow",
    text: "We use OrbitDev's GitHub analysis to benchmark our junior devs. Incredible data.",
    avatar: "https://i.pravatar.cc/100?img=32"
  },
  {
    name: "David Kim",
    role: "Full Stack Dev",
    text: "The roadmaps aren't static. They evolve as I commit code. It feels alive.",
    avatar: "https://i.pravatar.cc/100?img=60"
  },
  {
    name: "Alex Rivera",
    role: "DevOps Engineer",
    text: "Automation at its finest. The PR reviews save me hours every single week.",
    avatar: "https://i.pravatar.cc/100?img=8"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 overflow-hidden relative bg-[#030712] border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712]" />

      <div className="text-center mb-20 relative z-10 px-4">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Verified by the <span className="text-cyan-400">Elite.</span>
        </h2>
        <p className="text-gray-400 opacity-80 max-w-xl mx-auto text-lg">
          Engineers from top tech companies rely on our neural network to stay ahead.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030712] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030712] to-transparent z-10" />

        <div className="flex w-max animate-marquee gap-8 hover:[animation-play-state:paused] py-4">
          {[...testimonials, ...testimonials].map((item, i) => (
            <div
              key={`${item.name}-${i}`}
              className="w-[400px] p-8 rounded-2xl bg-[#0a0f1c] border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/10"
            >
              <Quote className="w-8 h-8 text-cyan-500/20 mb-4 group-hover:text-cyan-500/50 transition-colors" />
              <p className="text-gray-300 text-lg leading-relaxed mb-6 font-medium">"{item.text}"</p>

              <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full border border-white/10 group-hover:border-cyan-400/50 transition-colors"
                />
                <div>
                  <h4 className="text-white font-bold">{item.name}</h4>
                  <p className="text-sm text-cyan-400 font-mono tracking-wide">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
