import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import Navbar from "../components/hompage/Navbar";
import Hero from "../components/hompage/Hero";
import TechStackMarquee from "../components/hompage/TechStackMarquee";
import Features from "../components/hompage/Features";
import Testimonials from "../components/hompage/Testimonials";
import FinalCTA from "../components/hompage/FinalCTA";
import Footer from "../components/hompage/Footer";

// Lazy load heavy components if needed, but for homepage above-the-fold speed is key.
// Keeping imports direct for now.

export default function HomePage() {
  const { token, loading } = useAuth();

  if (loading) {
    // Simple loading spinner that matches the vibe
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <div className="text-cyan-500 font-mono text-sm animate-pulse">INITIALIZING...</div>
        </div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-[#030712] min-h-screen font-display relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Navbar */}
      <div className="relative z-50">
        <Navbar />
      </div>

      <main>
        <Hero />

        {/* Tech Stack Marquee (The "Divider" between Hero and Features) */}
        <TechStackMarquee />

        <Features />
        <Testimonials />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
