import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const loggedIn = isAuthenticated;
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Progress bar logic
  const scaleX = useSpring(useScroll().scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleScroll = (id) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
          ? "bg-[#030712]/70 backdrop-blur-2xl border-white/5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          : "bg-transparent border-transparent py-5"
          }`}
      >
        {/* Noise Texture Overlay for "frosted" glass feel */}
        {isScrolled && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
          />
        )}

        <div className="container mx-auto px-6 flex items-center justify-between relative z-10">
          {/* Logo with Glitch Interaction */}
          <div
            className="flex items-center gap-3 text-white group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="relative size-10 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 group-hover:border-cyan-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-cyan-400 relative z-10 group-hover:scale-110 transition-transform duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight font-display flex flex-col leading-none">
              <span className="text-white group-hover:text-cyan-400 transition-colors">OrbitDev</span>
              <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase group-hover:text-cyan-400/60 transition-colors">System v2.0</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <nav className="flex items-center p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
              {['features', 'testimonials', 'pricing'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleScroll(item)}
                  className="relative px-5 py-2 text-sm font-medium transition-colors text-gray-400 hover:text-white group"
                >
                  <span className="relative z-10 capitalize">{item}</span>
                  <div className="absolute inset-0 bg-white/10 rounded-full scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                </button>
              ))}
            </nav>

            <div className="w-px h-6 bg-white/10 mx-4" />

            {/* Auth Actions */}
            {!loggedIn ? (
              <div className="flex items-center gap-3">
                <button className="text-sm font-bold text-gray-400 hover:text-white transition-colors px-4 py-2" onClick={() => navigate("/login")}>
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-sm font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Scroll Progress Line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent origin-left"
          style={{ scaleX }}
        />
      </motion.header>
    </>
  );
}
