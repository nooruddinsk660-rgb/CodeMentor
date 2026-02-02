import { motion } from "framer-motion";

export default function BentoCard({ children, className = "", delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f1623] p-8 transition-all duration-500 hover:border-white/20 hover:bg-[#161f30] group ${className}`}
        >
            {/* 1. Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
            />

            {/* 2. Gradient Glow Effect on Hover */}
            <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:animate-shine" />

            {/* 3. Content */}
            <div className="relative z-10 h-full flex flex-col">
                {children}
            </div>

            {/* 4. Corner Accent */}
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
            </div>
        </motion.div>
    );
}
