import React from "react";

const TECH_STACK = [
    { name: "React", color: "#61DAFB" },
    { name: "Node.js", color: "#339933" },
    { name: "TypeScript", color: "#3178C6" },
    { name: "Python", color: "#3776AB" },
    { name: "OpenAI", color: "#412991" },
    { name: "PostgreSQL", color: "#336791" },
    { name: "Docker", color: "#2496ED" },
    { name: "AWS", color: "#FF9900" },
    { name: "Next.js", color: "#FFFFFF" },
    { name: "Tailwind", color: "#06B6D4" },
];

export default function TechStackMarquee() {
    return (
        <section className="py-10 bg-[#030712] border-y border-white/5 overflow-hidden relative z-20">
            {/* Vignette Gradients */}
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#030712] to-transparent z-10" />
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#030712] to-transparent z-10" />

            <div className="flex w-max animate-marquee gap-16 group hover:[animation-play-state:paused]">
                {[...TECH_STACK, ...TECH_STACK, ...TECH_STACK].map((tech, i) => (
                    <div
                        key={`${tech.name}-${i}`}
                        className="flex items-center gap-3 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 cursor-default"
                    >
                        {/* Simple dot indicator for now, replacing with logos would be ideal but this keeps it clean */}
                        <div
                            className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                            style={{ backgroundColor: tech.color, color: tech.color }}
                        />
                        <span className="text-xl font-bold font-mono tracking-wider text-white">
                            {tech.name}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
