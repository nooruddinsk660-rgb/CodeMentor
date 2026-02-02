import React from "react";

export default function DevOSBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gray-50 dark:bg-[#050510] transition-colors duration-500">
            {/* 1. Deep Space Gradient / Light Breeze Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-gray-100 to-gray-200 dark:from-[#0f172a] dark:via-[#050510] dark:to-[#000000]" />

            {/* 2. Noise Texture (Grain) */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* 3. Grid Overlay (Perspective) */}
            <div
                className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]"
                style={{
                    backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) scale(2)',
                    transformOrigin: 'top center',
                    maskImage: 'linear-gradient(to bottom, transparent, black 40%, transparent)'
                }}
            />

            {/* 4. Ambient Glow Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse delay-700" />
        </div>
    );
}
