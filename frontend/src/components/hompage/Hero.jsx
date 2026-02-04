import { motion } from "framer-motion";
import { ReactTyped } from "react-typed";
import { Reveal } from "./AnimatedLayout";
import MatrixRain from "./MatrixRain";
import OrbitalBackground from "./OrbitalBackground";
import React from "react";
import { ArrowRight, Terminal, Code2, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.body.classList.remove('crt-overlay');
  }, []);

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712]">
      {/* 0. Orbital God Structure */}
      <OrbitalBackground />

      {/* 1. Dynamic Background */}
      <div className="absolute inset-0 opacity-20">
        <MatrixRain />
      </div>

      {/* 2. Cinematic Glows - Refined for "Next Level" feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-[#030712]/60 to-[#030712] pointer-events-none" />

      {/* 3. Hero Content */}
      <div className="relative z-20 container mx-auto px-6 flex flex-col items-center text-center pt-32 pb-20">

        {/* System Badge */}
        <Reveal>
          <div className="inline-flex items-center gap-3 mb-10 px-6 py-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 text-cyan-300 text-xs md:text-sm font-mono tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(34,211,238,0.3)] backdrop-blur-xl group cursor-pointer hover:border-cyan-400/60 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            NEURAL_LINK_ESTABLISHED
          </div>
        </Reveal>

        {/* Main Title - SCALED DOWN (0.3x) */}
        <Reveal delay={0.1}>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight select-none drop-shadow-2xl">
            Architect Your <br />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-500 to-fuchsia-500 animate-gradient-xy pb-2 filter drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <ReactTyped
                strings={[
                  "Reality.",
                  "Legacy.",
                  "Universe.",
                  "Orbit."
                ]}
                typeSpeed={50}
                backSpeed={30}
                backDelay={1500}
                loop
              />
            </span>
          </h1>
        </Reveal>

        {/* Subtitle - Interactive Developer Appeal */}
        <Reveal delay={0.2}>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-light tracking-wide">
            <span className="text-cyan-400 font-bold font-mono mr-2">sudo ascend --force</span>
            The simulation is yours to control.
            <span className="block mt-3 text-gray-400 text-base md:text-lg font-mono">
              The hyper-accelerated trajectory for <span className="text-white font-semibold">1% Engineers</span>.
            </span>
          </p>
        </Reveal>

        {/* CTA Buttons */}
        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-8 items-center justify-center w-full">
            <button
              onClick={() => navigate('/signup')}
              className="group relative px-12 py-6 bg-white text-black font-black text-xl rounded-full overflow-hidden hover:scale-110 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(34,211,238,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-3">
                <Terminal className="w-7 h-7" />
                INITIATE_UPLINK
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>

            <button
              onClick={scrollToFeatures}
              className="px-12 py-6 rounded-full border-2 border-white/10 text-gray-200 font-bold text-lg hover:bg-white/5 hover:border-cyan-500/50 hover:text-cyan-300 transition-all backdrop-blur-md flex items-center gap-3 group hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]"
            >
              <Sparkles className="w-6 h-6 text-gray-500 group-hover:text-cyan-400 transition-colors animate-pulse" />
              <span>System_Capabilities</span>
            </button>
          </div>
        </Reveal>

        {/* Trust Badges - More "Techy" */}
        <Reveal delay={0.5}>
          <div className="mt-28 flex flex-col items-center gap-5 opacity-50 hover:opacity-100 transition-opacity duration-700">
            <p className="text-xs text-cyan-400/80 font-mono tracking-[0.4em] uppercase flex items-center gap-3">
              <Shield className="w-4 h-4" /> Trusted By Elite Squads At
            </p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {['Google', 'Netflix', 'SpaceX', 'OpenAI', 'Meta', 'Palantir'].map((tech) => (
                <span key={tech} className="text-xl md:text-2xl font-black text-white/20 hover:text-white hover:scale-110 transition-all cursor-crosshair tracking-widest uppercase">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
