import FeatureCard from "./FeatureCard";
import { Reveal } from "./AnimatedLayout";

const data = [
  { icon: "hub", title: "AI Mentor Matchmaking", description: "Mentor tailored to your goals" },
  { icon: "account_tree", title: "GitHub Analysis", description: "Deep PR code insights" },
  { icon: "map", title: "Roadmaps", description: "Structured learning system" }
];

export default function Features() {
  return (
    <section className="py-20">
      <Reveal>
        <h2 className="text-white text-3xl font-bold text-center mb-10">
          How CodeMentor Elevates Your Skills
        </h2>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {data.map((item, i) => (
          <Reveal delay={i * 0.2} key={item.title}>
            <FeatureCard {...item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
