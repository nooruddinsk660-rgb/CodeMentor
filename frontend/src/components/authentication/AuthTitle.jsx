export default function AuthTitle({ title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
        {title}
      </h1>
      <p className="text-sm text-gray-400 font-medium">
        {subtitle}
      </p>
    </div>
  );
}
