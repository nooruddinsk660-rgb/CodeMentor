export default function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-700"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#0f172a] px-3 text-xs text-slate-500">
          OR
        </span>
      </div>
    </div>
  );
}
