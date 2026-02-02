import { motion } from "framer-motion";
import { ReactTyped } from "react-typed";
import { Reveal } from "./AnimatedLayout";
import MatrixRain from "./MatrixRain";
import CodeCube from "./CodeCube";
import React from "react";

import { ArrowRight, Play, Terminal, Cpu, Shield, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Double protection: Ensure no CRT overlay on homepage
    document.body.classList.remove('crt-overlay');
  }, []);

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712] pt-20 lg:pt-0">
      {/* 1. Dynamic Matrix Rain Background */}
      <MatrixRain />

      {/* 2. Gradient Overlays for readability (Lightened) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712] z-10 pointer-events-none opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-[#030712]/20 to-[#030712] z-10 pointer-events-none" />

      {/* 3. Hero Content */}
      <div className="relative z-20 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Text & CTA */}
          <div className="text-left">
            <Reveal>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-mono tracking-wider backdrop-blur-md"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                SYSTEM_ONLINE // V2.0.4
              </motion.div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-snug">
                Accelerate            <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x glitch-active relative inline-block pb-1">
                  <ReactTyped
                    strings={[
                      "Dev Career.",
                      "Code Quality.",
                      "System Design.",
                      "Soft Skills.",
                    ]}
                    typeSpeed={50}
                    backSpeed={30}
                    backDelay={2000}
                    loop
                  />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10 border-l-2 border-white/10 pl-6">
                The only AI-powered mentor that analyzes your GitHub, builds personalized
                roadmaps, and simulates real-world engineering interviews.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <button
                  onClick={() => navigate('/signup')}
                  className="relative group px-8 py-4 bg-white text-black font-bold rounded-xl overflow-hidden hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Start Analysis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={scrollToFeatures}
                  className="px-8 py-4 rounded-xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 hover:border-cyan-500/30 hover:text-cyan-400 transition-all backdrop-blur-sm flex items-center justify-center gap-2 group whitespace-nowrap"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Code2 className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  System Capabilities
                </button>
              </div>
            </Reveal>

            {/* Trust Badges */}
            <Reveal delay={0.5}>
              <div className="mt-12 pt-8 border-t border-white/5">
                <p className="text-xs text-gray-500 font-mono mb-4 tracking-widest uppercase flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Trusted by Engineers at
                </p>
                <div className="flex flex-wrap gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  {['Google', 'Microsoft', 'Netflix', 'Amazon', 'Meta'].map((tech) => (
                    <span key={tech} className="text-base font-bold text-white/40 hover:text-white transition-colors cursor-default">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Visuals */}
          <div className="hidden lg:flex justify-center items-center relative perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <div className="w-[400px] h-[400px] border border-white/10 rounded-2xl bg-[#030712]/80 backdrop-blur-xl flex items-center justify-center relative shadow-2xl shadow-cyan-900/20">
                <div className="absolute top-0 left-0 right-0 h-8 border-b border-white/10 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <div className="ml-auto text-[10px] text-gray-500 font-mono">bash -- 80x24</div>
                </div>

                {/* The Code Cube */}
                <div className="scale-75 hover:scale-100 transition-transform duration-500">
                  <CodeCube size={200} />
                </div>

                {/* Floating Badges */}
                <motion.div
                  animate={{ x: [0, 10, 0], y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -right-8 top-20 bg-[#0f172a] p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">System Design</div>
                    <div className="text-sm font-bold text-white">Mastered</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ x: [0, -10, 0], y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -left-8 bottom-20 bg-[#0f172a] p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Terminal className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Code Quality</div>
                    <div className="text-sm font-bold text-white">Top 1%</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
