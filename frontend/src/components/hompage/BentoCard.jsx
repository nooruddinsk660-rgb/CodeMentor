import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function BentoCard({ children, className = "", delay = 0 }) {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setOpacity(1);
    };

    const handleBlur = () => {
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <motion.div
            ref={divRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-3xl bg-[#0f1623] group z-10 ${className}`}
        >
            {/* 
         1. Rotating Border Shimmer 
         Using a conic gradient that spins.
      */}
            <div
                className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden"
                style={{ zIndex: 0 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-shimmer-border"
                    style={{ backgroundSize: '200% 200%' }} // Simple linear shimmer fallback if conic fails
                />
            </div>

            {/* Main Card Content Container (Inset to reveal border) */}
            <div className="absolute inset-[1px] rounded-[22px] bg-[#0f1623] z-10 h-[calc(100%-2px)] w-[calc(100%-2px)] overflow-hidden">

                {/* 2. Spotlight Gradient (Mouse Follow) */}
                <div
                    className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(28, 107, 242, 0.1), transparent 40%)`,
                    }}
                />

                {/* 3. Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"
                    style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
                />

                {/* 4. Content */}
                <div className="relative z-20 h-full flex flex-col p-8">
                    {children}
                </div>

                {/* 5. Subtle Corner Accent */}
                <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                </div>
            </div>

            {/* Static Border (Visible when not hovering) */}
            <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none z-20 group-hover:border-transparent transition-colors duration-300" />

        </motion.div>
    );
}
