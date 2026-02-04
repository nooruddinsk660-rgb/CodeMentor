import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MatrixRain from "../hompage/MatrixRain";
import { Code2, ShieldCheck, Cpu } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="h-screen grid lg:grid-cols-2 bg-[#030712] font-display overflow-hidden text-white">

      {/* 1. LEFT PANEL: Form Section */}
      <div className="relative flex flex-col justify-center items-center p-6 lg:p-12 z-20 h-full">

        {/* Mobile Header (Logo) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 left-8 flex items-center gap-3"
        >
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <Code2 size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">OrbitDev</span>
          </Link>
        </motion.div>

        {/* Main Content Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-md relative"
        >
          {/* Background Glow */}
          <div className="absolute -inset-10 bg-blue-500/20 blur-3xl opacity-20 pointer-events-none rounded-full" />

          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-1 overflow-hidden">
            {/* Inner Glow Border */}
            <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
            <div className="bg-[#0A0F1C]/80 rounded-xl p-8 sm:p-12">
              {children}
            </div>
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center flex items-center gap-2 text-xs text-gray-500 font-mono"
        >
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Secured by DevOS Identity Matrix v2.0</span>
        </motion.div>
      </div>

      {/* 2. RIGHT PANEL: Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex relative bg-[#02040a] items-center justify-center overflow-hidden border-l border-white/5">

        {/* Matrix Rain Background */}
        <div className="absolute inset-0 opacity-40">
          <MatrixRain />
        </div>

        {/* Dynamic Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />

        {/* Overlay Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 p-12 max-w-lg text-center backdrop-blur-sm bg-black/20 rounded-3xl border border-white/5"
        >
          <div className="inline-flex mb-8 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Cpu size={48} className="text-blue-400 relative z-10" />
          </div>

          <h2 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Access the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 animate-gradient-x">
              Neural Network.
            </span>
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed font-light">
            "The difference between a junior and a senior is often just pattern recognition. Let us accelerate yours."
          </p>
        </motion.div>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#02040a_120%)]" />
      </div>

    </div>
  );
}
