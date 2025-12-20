export default function TestimonialCard({ img, name, role, text }) {
  return (
    <div className="rounded-xl border border-[#314568] bg-[#182334] p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <img src={img} className="h-12 w-12 rounded-full object-cover" />

        <div>
          <p className="text-white font-bold">{name}</p>
          <p className="text-[#90a6cb] text-sm">{role}</p>
        </div>
      </div>

      <p className="text-[#dbe1ec] italic">{text}</p>
    </div>
  );
}
