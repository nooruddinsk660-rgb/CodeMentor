import React from "react";
import { Navigate } from "react-router-dom"; 
import { useAuth } from "../auth/AuthContext";

import Navbar from "../components/hompage/Navbar";
import Hero from "../components/hompage/Hero";
import Features from "../components/hompage/Features";
import Testimonials from "../components/hompage/Testimonials";
import FinalCTA from "../components/hompage/FinalCTA";
import Footer from "../components/hompage/Footer";

export default function HomePage() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background-dark flex items-center justify-center text-blue-500">Loading...</div>;
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-background-dark min-h-screen font-display">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}