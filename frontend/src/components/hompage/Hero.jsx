import { motion } from "framer-motion";
import { ReactTyped } from "react-typed";
import { useEffect, useRef } from "react";
import { ParallaxBg, Reveal } from "./AnimatedLayout";

export default function Hero() {
  const canvasRef = useRef(null);

  // particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 75 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.25 + 0.05,
    }));

    function animate() {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253, ${p.opacity})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x > w) p.x = 0;
        if (p.x < 0) p.x = w;
        if (p.y > h) p.y = 0;
        if (p.y < 0) p.y = h;
      });

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });
  }, []);

  return (
    <section className="relative overflow-hidden pt-28 pb-40 px-4 sm:px-8 bg-background-dark">
      <canvas ref={canvasRef} className="absolute inset-0 -z-20 w-full h-full" />

      {/* parallax glowing blobs */}
      <ParallaxBg className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px]"></div>
        <div className="absolute top-1/2 right-1/3 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[150px]"></div>
      </ParallaxBg>

      {/* center hero */}
      <div className="max-w-4xl mx-auto text-center">
        <Reveal>
          <motion.h1
            className="text-white text-4xl sm:text-6xl font-black leading-tight"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Accelerate your development career.
            <br />
            <span className="block text-primary mt-3">
              <ReactTyped
                strings={[
                  "AI Mentorship",
                  "Personalized Roadmaps",
                  "Smart Code Reviews",
                  "System Design Mastery",
                ]}
                typeSpeed={45}
                backSpeed={30}
                loop
              />
            </span>
          </motion.h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-[#90a6cb] text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Expert-level feedback, data-driven learning paths, and an interactive AI-powered
            playground — designed to help you grow faster and become truly hireable.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mt-10 flex justify-center gap-4 flex-col sm:flex-row">
            <button className="px-7 py-4 bg-primary text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-xl">
              Get Your First AI Review
            </button>

            <button className="px-7 py-4 border border-[#314568] text-[#dbe1ec] rounded-xl hover:bg-white/10 transition-all">
              Explore Features
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.6}>
          <p className="text-[#8ea2c0] text-sm mt-8">
            Trusted by 15,000+ developers • 95% rated 5-stars
          </p>
        </Reveal>
      </div>
    </section>
  );
}
