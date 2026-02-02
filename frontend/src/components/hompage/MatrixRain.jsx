import { useEffect, useRef } from "react";

export default function MatrixRain() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const columns = Math.floor(width / 20);
        const drops = Array(columns).fill(1).map(() => Math.random() * -100); // Randomize start y

        // Matrix characters (Katakana + Latin)
        const chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンabcdefghijklmnopqrstuvwxyz0123456789";

        const draw = () => {
            // translucent black background for trail effect
            ctx.fillStyle = "rgba(10, 10, 20, 0.05)";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "#0F0"; // Green text (classic matrix) - will override with gradient
            ctx.font = "15px monospace";

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const text = chars[Math.floor(Math.random() * chars.length)];

                // Gradient effect: Head is bright white/blue, tail is green
                const gradient = ctx.createLinearGradient(0, drops[i] * 20 - 50, 0, drops[i] * 20);
                gradient.addColorStop(0, "rgba(0, 255, 70, 0)");
                gradient.addColorStop(0.8, "#0F0");
                gradient.addColorStop(1, "#CEF"); // Bright head

                ctx.fillStyle = gradient; // Apply gradient
                // Or simple green if gradient is too heavy: ctx.fillStyle = "#0F0";

                ctx.fillText(text, i * 20, drops[i] * 20);

                // Reset drop to top randomly
                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-15 pointer-events-none mix-blend-screen" />;
}
