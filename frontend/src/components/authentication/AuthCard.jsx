export default function AuthCard({ children }) {
  return (
    <div className="
      w-full max-w-[440px]
      bg-[#0f172a]/80
      backdrop-blur-xl
      rounded-2xl
      border border-white/10
      shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]
      p-8
    ">
      {children}
    </div>
  );
}
