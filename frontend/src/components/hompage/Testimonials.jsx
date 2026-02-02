import { motion } from "framer-motion";

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
    <section id="testimonials" className="py-24 overflow-hidden relative bg-[#030712]">

      <div className="text-center mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Trusted by the <span className="text-cyan-400">Best.</span>
        </h2>
        <p className="text-gray-400 opacity-80">
          Engineers from top companies rely on our neural network.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full mask-linear-fade">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030712] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030712] to-transparent z-10" />

        <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing">
          {[...testimonials, ...testimonials].map((item, i) => (
            <div
              key={i}
              className="w-[400px] h-[200px] p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full border border-white/10 group-hover:border-cyan-400/50 transition-colors"
                />
                <div>
                  <h4 className="text-white font-bold">{item.name}</h4>
                  <p className="text-xs text-cyan-400 font-mono">{item.role}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">"{item.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
