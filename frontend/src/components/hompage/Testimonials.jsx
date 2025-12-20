import TestimonialCard from "./TestimonialCard";
import { Reveal } from "./AnimatedLayout";

const list = [
  {
    img: "https://i.pravatar.cc/100?img=58",
    name: "Sarah Chen",
    role: "Software Engineer @ TechCorp",
    text: "CodeMentor changed the way I understand code reviews forever."
  },
  {
    img: "https://i.pravatar.cc/100?img=23",
    name: "Michael Rodriguez",
    role: "Full-Stack Developer",
    text: "The roadmap got me job-ready in record time."
  }
];

export default function Testimonials() {
  return (
    <section className="py-20">
      <Reveal>
        <h2 className="text-white text-3xl font-bold text-center mb-10">
          Trusted by Developers Worldwide
        </h2>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-8 p-4">
        {list.map((item, i) => (
          <Reveal delay={i * 0.25} key={item.name}>
            <TestimonialCard {...item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
