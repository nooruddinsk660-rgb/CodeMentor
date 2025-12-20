export default function AuthTitle({ title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-white tracking-tight">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}
