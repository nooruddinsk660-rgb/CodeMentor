import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useState, useEffect } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal, ArrowRight } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Progress Bar
  const scaleX = useSpring(useScroll().scrollYProgress, {
    stiffness: 100, damping: 30, restDelta: 0.001
  });

  useEffect(() => {
    return scrollY.on("change", (latest) => setIsScrolled(latest > 20));
  }, [scrollY]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'features', label: 'Features' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'pricing', label: 'Pricing' }
  ];

  const handleScroll = (id) => {
    setMobileMenuOpen(false);
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
            ? "bg-[#030712]/80 backdrop-blur-xl border-white/5 py-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
            : "bg-transparent border-transparent py-5"
          }`}
      >
        <div className="container mx-auto px-6 h-full flex items-center justify-between relative z-50">

          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-cyan-400/50 transition-colors">
              <div className="absolute inset-0 bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <Terminal className="w-5 h-5 text-cyan-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight text-lg leading-none group-hover:text-cyan-400 transition-colors">OrbitDev</h1>
              <span className="text-[9px] text-gray-500 font-mono tracking-[0.2em] uppercase">System v2.0</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleScroll(link.id)}
                  className="px-5 py-1.5 text-sm text-gray-400 hover:text-white transition-colors relative"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="h-6 w-px bg-white/10" />

            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button onClick={() => navigate("/login")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Log In</button>
                <button onClick={() => navigate("/signup")} className="group relative px-5 py-2 bg-white text-black text-sm font-bold rounded-full overflow-hidden hover:scale-105 transition-transform">
                  <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight className="w-4 h-4" /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            ) : (
              <button onClick={handleLogout} className="px-5 py-2 text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-full hover:bg-red-400/20 transition-colors">
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Scroll Progress */}
        <motion.div style={{ scaleX }} className="absolute bottom-0 left-0 right-0 h-[1px] bg-cyan-500 origin-left" />
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#030712] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleScroll(link.id)}
                  className="text-2xl font-bold text-gray-300 hover:text-cyan-400 text-left py-4 border-b border-white/5"
                >
                  {link.label}
                </button>
              ))}

              <div className="mt-8 flex flex-col gap-4">
                {!isAuthenticated ? (
                  <>
                    <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="w-full py-4 text-center text-lg font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white">
                      Log In
                    </button>
                    <button onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }} className="w-full py-4 text-center text-lg font-bold bg-white text-black rounded-xl hover:bg-cyan-50 text-black">
                      Get Started
                    </button>
                  </>
                ) : (
                  <button onClick={handleLogout} className="w-full py-4 text-center text-lg font-bold text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
                    System Logout
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
