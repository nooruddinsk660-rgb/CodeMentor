import { Reveal } from "./AnimatedLayout";
import { Link, useNavigate } from "react-router-dom";

export default function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="py-20 text-center px-4">
      <Reveal>
        <h2 className="text-white text-4xl font-bold">Ready to Accelerate Your Career?</h2>
      </Reveal>

      <Reveal delay={0.2}>
        <p className="text-[#90a6cb] max-w-xl mx-auto mt-4">
          Join thousands of developers leveling up with AI-powered mentorship.
        </p>
      </Reveal>

      <Reveal delay={0.3}>
        <button
          onClick={()=> navigate("/signup")}
          className="mt-8 px-8 py-4 bg-primary text-white rounded-xl hover:scale-105 transition"
        >
          Sign Up Now
        </button>
      </Reveal>
    </section>
  );
}
