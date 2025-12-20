import Navbar from "../components/hompage/Navbar";
import Hero from "../components/hompage/Hero";
import Features from "../components/hompage/Features";
import Testimonials from "../components/hompage/Testimonials";
import FinalCTA from "../components/hompage/FinalCTA";
import Footer from "../components/hompage/Footer";

export default function HomePage() {
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
