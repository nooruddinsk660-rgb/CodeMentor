import { BrainCircuit, Map, GitPullRequest, ArrowRight, CheckCircle2, Cpu, Zap, Code } from "lucide-react";
import BentoCard from "./BentoCard";
import { Reveal } from "./AnimatedLayout";

export default function Features() {
  return (
    <section id="features" className="relative py-32 px-4 sm:px-8 bg-[#030712] overflow-hidden">
      {/* Background Circuit Traces (CSS only or SVG) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Glow Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="mb-24 text-center max-w-3xl mx-auto">
            <div className="inline-block mb-4 px-4 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400 text-sm font-mono tracking-widest uppercase">
              System Capabilities
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
              Engineered for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Genetic Code Evolution.
              </span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              We transcend simple tutorials. Our neural architecture dissects your actual commit history,
              providing the deep implementation feedback usually reserved for FAANG architecture reviews.
            </p>
          </div>
        </Reveal>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">

          {/* Item 1: Neural Mentor (Large) */}
          <BentoCard className="md:col-span-6 lg:col-span-8 group/card">
            <div className="mb-auto">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400 group-hover/card:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 group-hover/card:text-cyan-400 transition-colors tracking-tight">
                Neural Mentor V2
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                An always-available principal engineer that understands context. It doesn't just fix syntax;
                it optimizes Big-O complexity and patches zero-day vulnerabilities.
              </p>
            </div>

            {/* Visual Decoration: Code Snippet */}
            <div className="mt-8 relative p-5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-gray-400 overflow-hidden shadow-2xl backdrop-blur-sm group-hover/card:border-cyan-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-3 text-green-400 text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider backdrop-blur-md bg-green-500/10 rounded-bl-xl border-b border-l border-green-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> O(log n) Optimized
              </div>
              <div className="space-y-1.5 opacity-80 pt-2">
                <div className="flex"><span className="text-purple-400">async function</span> <span className="text-blue-300 ml-2">analyzeGraph</span><span className="text-white">(nodes)</span> {"{"}</div>
                <div className="flex pl-4 text-gray-500 opacity-70">// Implementing A* Search Algorithm</div>
                <div className="flex pl-4"><span className="text-purple-400">const</span> path = <span className="text-yellow-300">await</span> grid.optimize(nodes);</div>
                <div className="flex pl-4"><span className="text-purple-400">return</span> path.reduce((acc, curr) ={">"} ...);</div>
                <div className="flex">{"}"}</div>
              </div>
            </div>
          </BentoCard>

          {/* Item 2: Dynamic Roadmaps (Tall) */}
          <BentoCard className="md:col-span-6 lg:col-span-4 group/card" delay={0.1}>
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 text-green-400 group-hover/card:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
              <Map className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover/card:text-green-400 transition-colors tracking-tight">Adaptive Roadmaps</h3>
            <p className="text-gray-400 mb-8 text-sm">
              Static PDFs are dead. Your curriculum mutates in real-time based on the code you push.
            </p>

            <div className="mt-auto space-y-4 relative">
              {/* Connecting Line */}
              <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-white/10" />

              {['Distributed Systems', 'Graph Theory', 'Rust Concurrency'].map((step, i) => (
                <div key={step} className="flex items-center gap-4 relative z-10 group/item">
                  <div className={`w-6 h-6 rounded-full border-4 border-[#0f1623] flex items-center justify-center shrink-0 transition-all duration-300 ${i === 2 ? 'bg-gray-700' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'}`} />
                  <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/5 group-hover/item:bg-white/10 transition-colors">
                    <span className={`text-xs font-bold font-mono uppercase tracking-wider ${i === 2 ? 'text-gray-500' : 'text-green-400'}`}>
                      {i === 2 ? 'LOCKED' : 'MASTERED'}
                    </span>
                    <div className="text-white text-sm font-medium">{step}</div>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Item 3: GitHub Integration (Full Width) */}
          <BentoCard className="md:col-span-12 lg:col-span-12 flex flex-col md:flex-row items-center gap-10 group/card bg-gradient-to-r from-[#0f1623] to-[#0f1623]" delay={0.2}>

            <div className="flex-1 w-full relative order-2 md:order-1">
              {/* Terminal Design */}
              <div className="w-full rounded-xl border border-white/10 bg-[#050910] font-mono text-xs shadow-2xl overflow-hidden group-hover/card:border-purple-500/30 transition-colors duration-500">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 text-red-500 border border-red-500/30" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 text-green-500 border border-green-500/30" />
                  </div>
                  <div className="text-gray-500 text-[10px]">gh-integration — zsh</div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">➜</span>
                    <span className="text-cyan-400">~/project</span>
                    <span className="text-white">git push origin feature/api-v2</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    <div className="text-gray-500">Enumerating objects: 12, done.</div>
                    <div className="text-gray-500">Writing objects: 100% (12/12), 1.24 KiB | 1.24 MiB/s, done.</div>
                  </div>
                  <div className="pl-6 pt-2 animate-pulse text-green-400 font-bold">
                    → OrbitDev Watcher Detected Change...
                    <br />
                    → Triggering Automatic Code Review...
                  </div>
                  <div className="pl-6 pt-2 flex items-center gap-2">
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-[10px] border border-purple-500/30">+150 XP</span>
                    <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-[10px] border border-cyan-500/30">Velocity: HIGH</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 order-1 md:order-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover/card:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                <GitPullRequest className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 group-hover/card:text-purple-400 transition-colors tracking-tight">Zero-Friction Sync</h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Connect your repositories once. We automatically digest every PR, tracking your "Code Velocity"
                and updating your skill profile without a single second of manual data entry.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Automatic Parsing', 'Commit Analysis', 'Velocity Tracking', 'Skill Extraction'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-gray-400 font-mono hover:bg-white/10 transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </BentoCard>

        </div>
      </div>
    </section>
  );
}
