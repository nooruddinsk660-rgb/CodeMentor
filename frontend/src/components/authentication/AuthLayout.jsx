import MatrixRain from "../hompage/MatrixRain";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#030712] font-display overflow-hidden">

      {/* 1. LEFT PANEL: Form */}
      <div className="relative flex flex-col justify-center items-center p-8 lg:p-12 z-20">

        {/* Mobile Header (Logo) */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600/30 transition-colors">
              <span className="material-symbols-outlined text-lg">code</span>
            </div>
            <span className="text-white font-bold tracking-tight">OrbitDev</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>

        <div className="mt-8 text-center text-xs text-gray-600 font-mono">
          System secured by DevOS Identity Matrix v2.0
        </div>
      </div>

      {/* 2. RIGHT PANEL: Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex relative bg-[#02040a] items-center justify-center overflow-hidden border-l border-white/5">
        {/* Matrix Rain Background */}
        <MatrixRain />

        {/* Overlay Content */}
        <div className="relative z-10 p-12 max-w-lg text-center">
          <div className="inline-flex mb-6 p-4 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <span className="material-symbols-outlined text-blue-400 text-3xl animate-pulse">fingerprint</span>
          </div>

          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
            Access the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Neural Network.</span>
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            "The difference between a junior and a senior is often just pattern recognition. Let us accelerate yours."
          </p>
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#02040a_120%)]" />
      </div>

    </div>
  );
}
