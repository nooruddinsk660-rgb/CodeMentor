import { BrainCircuit, Map, GitPullRequest, ArrowRight, CheckCircle2 } from "lucide-react";
import BentoCard from "./BentoCard";
import { Reveal } from "./AnimatedLayout";

export default function Features() {
  return (
    <section id="features" className="relative py-32 px-4 sm:px-8 bg-[#030712] overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Constructed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Elite Engineering.</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Go beyond simple tutorials. Our AI architecture dissects your actual code,
              providing the deep feedback usually reserved for FAANG code reviews.
            </p>
          </div>
        </Reveal>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[300px]">

          {/* Item 1: Large Feature (AI Mentor) */}
          <BentoCard className="md:col-span-6 lg:col-span-8 bg-gradient-to-br from-blue-900/10 to-black/40 group/card">
            <div className="mb-auto">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover/card:scale-110 transition-transform duration-300">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover/card:text-blue-400 transition-colors">Neural Mentor V2</h3>
              <p className="text-gray-400">
                An always-available senior engineer that understands context. It doesn't just fix syntax;
                it suggests architectural improvements and catches security vulnerabilities before you commit.
              </p>
            </div>
            {/* Visual Decoration: Code Snippet Analysis */}
            <div className="mt-8 relative p-4 rounded-lg bg-black/40 border border-white/5 font-mono text-xs text-gray-400 overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-green-400 text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Optimized
              </div>
              <div className="space-y-1 opacity-70">
                <div className="flex"><span className="text-purple-400">const</span> <span className="text-blue-300 ml-2">optimize</span> = <span className="text-white">(data)</span> ={">"} {"{"}</div>
                <div className="flex pl-4 text-gray-500">// O(n) complexity achieved</div>
                <div className="flex pl-4"><span className="text-purple-400">return</span> data.reduce(...)</div>
                <div className="flex">{"}"}</div>
              </div>
            </div>
          </BentoCard>

          {/* Item 2: Tall Feature (Roadmaps) */}
          <BentoCard className="md:col-span-6 lg:col-span-4 group/card" delay={0.1}>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400 group-hover/card:scale-110 transition-transform duration-300">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover/card:text-green-400 transition-colors">Dynamic Roadmaps</h3>
            <p className="text-gray-400 text-sm mb-6">
              Forget static PDFs. Your curriculum adapts live based on the code you write and the skills you master.
            </p>
            <div className="mt-auto space-y-3">
              {['System Design', 'Graph Choice', 'Concurrency'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-gray-600' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
                  <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full bg-green-500/50 rounded-full ${i === 2 ? 'w-0' : 'w-full'}`} />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{step}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Item 3: Wide Feature (GitHub Sync) */}
          <BentoCard className="md:col-span-12 lg:col-span-12 flex flex-col md:flex-row items-center gap-8 group/card" delay={0.2}>
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover/card:scale-110 transition-transform duration-300">
                <GitPullRequest className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover/card:text-purple-400 transition-colors">Deep GitHub Integration</h3>
              <p className="text-gray-400">
                Connect your repositories once. We automatically analyze every PR, tracking your "Code Velocity"
                and updating your skill profile without manual data entry.
              </p>
            </div>
            {/* Visual Decoration: Terminal Git Graph */}
            <div className="flex-1 w-full max-w-md p-5 rounded-xl border border-white/5 bg-[#0d1117] font-mono text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <span className="text-gray-500">terminal</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><span className="text-purple-400">➜</span> <span className="text-cyan-400">~</span> <span className="text-gray-400">git commit -m "feat: optimized api"</span></div>
                <div className="flex items-center gap-2"><span className="text-gray-500">[main 8f2a1b] feat: optimized api</span></div>
                <div className="flex items-center gap-2 mt-2"><span className="text-purple-400">➜</span> <span className="text-cyan-400">~</span> <span className="text-gray-400">git push origin main</span></div>
                <div className="text-gray-500 mt-1">Enumerating objects: 5, done.</div>
                <div className="text-green-400 mt-2">→ Triggering Neural Analysis...</div>
                <div className="text-purple-400 font-bold bg-purple-500/10 inline-block px-2 py-0.5 rounded mt-1">→ +150 XP Earned</div>
              </div>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}
