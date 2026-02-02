import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const loggedIn = isAuthenticated; // Alias for existing logic
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
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
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 py-3"
        : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 text-white group cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative size-9 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-lg group-hover:bg-blue-500/40 transition-all" />
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-blue-400 relative z-10"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight font-mono">
            Orbit<span className="text-blue-400">Dev</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-8 text-sm font-medium font-mono">
            {['features', 'testimonials', 'pricing'].map((item) => (
              <button
                key={item}
                onClick={() => handleScroll(item)}
                className="text-gray-400 hover:text-cyan-400 transition-colors capitalize relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Auth Actions */}
          {!loggedIn ? (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-bold transition-all backdrop-blur-sm"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-bold hover:bg-red-500/20 transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
