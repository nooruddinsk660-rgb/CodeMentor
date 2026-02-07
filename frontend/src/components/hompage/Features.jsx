import { BrainCircuit, Map, GitPullRequest, ArrowRight, CheckCircle2, Cpu, Zap, Code, Shield } from "lucide-react";
import BentoCard from "./BentoCard";
import { Reveal } from "./AnimatedLayout";

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#030712] overflow-hidden">
      {/* Background Circuit Traces */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Glow Orbs */}
      <div className="absolute top-0 right-0 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-cyan-900/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-900/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="mb-20 md:mb-24 text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-cyan-400/80 text-xs md:text-sm font-mono tracking-[0.2em] uppercase backdrop-blur-md">
              System Capabilities v2.0
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-[1.1] text-balance">
              Engineered for <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
                Genetic Code Evolution.
              </span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-2xl mx-auto text-balance font-light">
              We transcend simple tutorials. Our neural architecture dissects your <span className="text-white font-medium">actual commit history</span>,
              providing the deep feedback usually reserved for FAANG staff engineers.
            </p>
          </div>
        </Reveal>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 md:gap-8 auto-rows-[minmax(450px,auto)]">

          {/* Item 1: Neural Mentor (Large) */}
          <BentoCard className="md:col-span-6 lg:col-span-8 group/card relative overflow-visible">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] group-hover/card:bg-cyan-500/20 transition-all duration-700" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400 group-hover/card:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                  <BrainCircuit className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover/card:text-cyan-400 transition-colors tracking-tight">
                  Neural Mentor
                </h3>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg mb-8">
                  An always-available principal engineer explaining <span className="text-white">Big-O complexity</span> and refactoring patterns in real-time.
                </p>
              </div>

              {/* Code Snippet Decoration */}
              <div className="relative rounded-xl bg-[#09090b] border border-white/10 shadow-2xl group-hover/card:border-cyan-500/30 transition-all duration-500 w-full overflow-hidden">
                {/* Window Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono tracking-wide">mentor_core.ts</div>
                </div>

                {/* Code Content */}
                <div className="p-5 font-mono text-xs md:text-[13px] text-gray-300 leading-7 overflow-x-auto custom-scrollbar bg-[#0c0c0e]">
                  <div className="flex w-max min-w-full hover:bg-white/[0.02] transition-colors rounded px-1">
                    <span className="text-gray-600 select-none w-6 text-right pr-3 text-[10px] pt-0.5">1</span>
                    <span><span className="text-purple-400">async</span> <span className="text-purple-400">function</span> <span className="text-blue-400">optimizeGraph</span><span className="text-yellow-500">(</span><span className="text-orange-300">nodes</span><span className="text-yellow-500">)</span> <span className="text-yellow-500">{"{"}</span></span>
                  </div>

                  <div className="flex w-max min-w-full hover:bg-white/[0.02] transition-colors rounded px-1 group/line">
                    <span className="text-gray-600 select-none w-6 text-right pr-3 text-[10px] pt-0.5 opacity-50">2</span>
                    <span className="text-gray-500 italic flex items-center gap-2">
                        // O(n^2) detected. Refactoring to O(n)...
                      <span className="opacity-0 group-hover/line:opacity-100 transition-opacity text-[10px] text-cyan-500 border border-cyan-500/30 px-1 rounded">AI INTEL</span>
                    </span>
                  </div>

                  {/* Optimized Lines Gradient */}
                  <div className="relative my-1">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-green-500 shadow-[0_0_10px_#22c55e]" />
                    <div className="absolute inset-0 bg-green-500/[0.03] pointer-events-none" />

                    <div className="flex w-max min-w-full pl-2 py-0.5 hover:bg-green-500/[0.05] transition-colors">
                      <span className="text-gray-600 select-none w-6 text-right pr-3 text-[10px] pt-0.5">3</span>
                      <span><span className="text-purple-400">const</span> <span className="text-cyan-300">cache</span> <span className="text-white">=</span> <span className="text-purple-400">new</span> <span className="text-yellow-300">Map</span>();</span>
                    </div>
                    <div className="flex w-max min-w-full pl-2 py-0.5 hover:bg-green-500/[0.05] transition-colors">
                      <span className="text-gray-600 select-none w-6 text-right pr-3 text-[10px] pt-0.5">4</span>
                      <span><span className="text-purple-400">return</span> <span className="text-orange-300">nodes</span>.<span className="text-blue-400">reduce</span>((<span className="text-orange-300">acc</span>, <span className="text-orange-300">curr</span>) <span className="text-purple-400">={">"}</span> ...);</span>
                    </div>
                  </div>

                  <div className="flex w-max min-w-full hover:bg-white/[0.02] transition-colors rounded px-1">
                    <span className="text-gray-600 select-none w-6 text-right pr-3 text-[10px] pt-0.5">5</span>
                    <span className="text-yellow-500">{"}"}</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Item 2: Dynamic Roadmaps (Tall) */}
          <BentoCard className="md:col-span-6 lg:col-span-4 group/card min-h-[500px]" delay={0.1}>
            <div className="absolute -left-10 bottom-0 w-40 h-40 bg-green-500/10 rounded-full blur-[80px]" />

            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 text-green-400 group-hover/card:scale-110 transition-transform duration-500">
              <Map className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover/card:text-green-400 transition-colors tracking-tight">Adaptive Roadmaps</h3>
            <p className="text-gray-400 mb-8 text-sm md:text-base leading-relaxed">
              Static PDFs are dead. Your curriculum mutates in real-time based on the code you push.
            </p>

            <div className="mt-auto space-y-6 relative pl-2">
              {/* Dynamic Beam Line */}
              <div className="absolute left-[19px] top-2 bottom-6 w-[2px] bg-gradient-to-b from-green-500/50 via-green-500/20 to-transparent" />

              {['Distributed Systems', 'Graph Theory', 'Rust Concurrency'].map((step, i) => (
                <div key={step} className="flex items-center gap-4 relative z-10 group/item">
                  <div className={`w-4 h-4 rounded-full border-[3px] box-content flex items-center justify-center shrink-0 transition-all duration-300 relative z-10 ${i === 2 ? 'border-gray-700 bg-[#0f1623]' : 'border-green-500 bg-[#0f1623] shadow-[0_0_10px_#22c55e]'}`}>
                    {i !== 2 && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                  </div>

                  <div className={`flex-1 p-3 rounded-lg border transition-all duration-300 ${i === 2 ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-green-500/[0.05] border-green-500/20 group-hover/item:border-green-500/40'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-bold font-mono uppercase tracking-wider ${i === 2 ? 'text-gray-500' : 'text-green-400'}`}>
                        {i === 2 ? 'LOCKED' : 'MASTERED'}
                      </span>
                      {i === 1 && <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 rounded animated-pulse">CURRENT</span>}
                    </div>
                    <div className="text-white text-sm font-medium tracking-tight">{step}</div>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Item 3: GitHub Integration (Full Width) */}
          <BentoCard className="md:col-span-12 lg:col-span-12 group/card bg-gradient-to-r from-[#0a0e17] to-[#0f1623]" delay={0.2}>

            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 h-full w-full">
              <div className="flex-1 w-full order-2 lg:order-1">
                <div className="w-full rounded-xl border border-white/10 bg-[#09090b] font-mono text-[10px] md:text-xs shadow-2xl overflow-hidden group-hover/card:border-purple-500/30 transition-colors duration-500 relative">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                  <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 bg-white/[0.02]">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700/50" />
                    </div>
                    <div className="text-gray-600 text-[10px] font-medium">terminal — zsh</div>
                  </div>

                  <div className="p-4 md:p-6 space-y-4 font-mono">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-purple-400">➜</span>
                      <span className="text-cyan-400">~/orbit</span>
                      <span className="text-white typing-effect border-r-2 border-white pr-1 animate-pulse">git push origin feature/vessel</span>
                    </div>

                    <div className="pl-4 space-y-1 opacity-70 text-xs text-gray-400 leading-relaxed">
                      <div>Enumerating objects: 12, done.</div>
                      <div>Writing objects: 100% (12/12), 1.24 KiB | 1.24 MiB/s, done.</div>
                      <div className="text-green-400/80">Total 12 (delta 4), reused 0 (delta 0)</div>
                    </div>

                    <div className="pl-4 pt-2">
                      <div className="inline-flex items-center gap-2 text-green-400 font-bold bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20 animate-pulse">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span className="tracking-wide text-[11px] uppercase">OrbitDev Watcher: Sync Complete</span>
                      </div>
                    </div>

                    <div className="pl-4 flex flex-wrap gap-2">
                      <span className="bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded text-[10px] font-bold border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">+150 XP</span>
                      <span className="bg-cyan-500/10 text-cyan-300 px-2.5 py-1 rounded text-[10px] font-bold border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">Velocity: HIGH</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full order-1 lg:order-2">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover/card:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                  <GitPullRequest className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 group-hover/card:text-purple-400 transition-colors tracking-tight">
                  Zero-Friction Sync
                </h3>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6">
                  Connect your repositories once. We automatically digest every PR, tracking your <span className="text-white italic">"Code Velocity"</span>
                  and updating your skill profile without a single second of data entry.
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {['Automatic Parsing', 'Commit Analysis', 'Velocity Tracking'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] md:text-xs text-gray-300 font-mono hover:bg-white/10 transition-colors border-l-2 border-l-purple-500/50">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </BentoCard>

        </div>
      </div>
    </section>
  );
}
