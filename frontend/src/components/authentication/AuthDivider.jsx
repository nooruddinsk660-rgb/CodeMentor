export default function AuthDivider() {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#0A0F1C] px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Or continue with
        </span>
      </div>
    </div>
  );
}
