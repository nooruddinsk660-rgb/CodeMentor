export default function AuthLayout({ children }) {
  return (
    <div className="
      min-h-screen
      flex items-center justify-center
      bg-gradient-to-br
      from-[#0b1220]
      via-[#020617]
      to-black
      font-display
      p-4
    ">
      {children}
    </div>
  );
}
