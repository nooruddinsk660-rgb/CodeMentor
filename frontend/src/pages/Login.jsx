import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader, ArrowRight, Github } from "lucide-react";
import { motion } from "framer-motion";
import CodeCube from "../components/hompage/CodeCube";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard/main");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [isDesktop, setIsDesktop] = useState(window.matchMedia("(min-width: 1024px)").matches);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const listener = () => setIsDesktop(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto">

      {/* LEFT: Branding / 3D (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-gradient-to-br from-gray-900 to-black overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent opacity-50" />
        <div className="relative z-10 transform scale-75">
          {/* Only render 3D element on desktop to save mobile battery/performance */}
          {isDesktop && <CodeCube size={400} />}
        </div>
        <div className="absolute bottom-10 left-10 text-white/40 font-mono text-xs tracking-widest uppercase">
          Secure Access Terminal v9.0
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 lg:hidden" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-gray-400">Enter your credentials to access the system.</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                  placeholder="developer@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            >
              {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : (
                <>
                  Authorized Access <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-xs text-gray-600 font-mono">OR CONTINUE WITH</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          {/* Social Auth */}
          <button
            onClick={loginWithGithub}
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-white font-medium hover:bg-white/10 transition-colors"
          >
            <Github className="w-5 h-5" />
            GitHub Protocol
          </button>

          {/* Footer */}
          <p className="mt-8 text-center text-gray-500 text-sm">
            Don't have an ID? <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline">Request Access</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;