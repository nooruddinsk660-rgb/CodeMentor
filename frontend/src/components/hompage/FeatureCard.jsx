export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-xl border border-[#314568] bg-[#182334] p-6 flex flex-col gap-4">
      <div className="text-primary bg-primary/20 p-3 rounded-lg">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>

      <h3 className="text-white text-lg font-bold">{title}</h3>
      <p className="text-[#90a6cb] text-sm">{description}</p>
    </div>
  );
}
