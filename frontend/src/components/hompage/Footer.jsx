import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

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
    <footer className="border-t border-white/5 bg-[#030712] pt-16 pb-8 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">

        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-white mb-4">
            <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-bold">O</span>
            </div>
            <span className="text-xl font-bold tracking-tight">OrbitDev</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            AI-powered architectures for next-gen engineers. Built for those who ship.
          </p>
        </div>

        <div>
          <p className="font-bold text-white mb-6 uppercase text-xs tracking-wider opacity-80">Product</p>
          <ul className="space-y-4">
            <li><button onClick={() => handleScroll('features')} className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Features</button></li>
            {/* Pricing section doesn't exist yet, linking to features as placeholder or removing */}
            <li><button onClick={() => handleScroll('testimonials')} className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Testimonials</button></li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-white mb-6 uppercase text-xs tracking-wider opacity-80">Company</p>
          <ul className="space-y-4">
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">About Us</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Blog</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Careers</a></li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-white mb-6 uppercase text-xs tracking-wider opacity-80">Legal</p>
          <ul className="space-y-4">
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Privacy</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Terms</a></li>
          </ul>
        </div>

      </div>

      <div className="mt-16 pt-8 border-t border-white/5 text-center flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
        <p className="text-gray-500 text-sm font-mono">
          © 2026 OrbitDev Systems.
        </p>
        <div className="flex gap-4">
          {/* Social Icons placeholder */}
          <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-gray-400 hover:text-white">Github</div>
          <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-gray-400 hover:text-white">Twitter</div>
        </div>
      </div>
    </footer>
  );
}
