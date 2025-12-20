export default function SocialAuthButton({ text }) {
  return (
    <button className="
      w-full h-11 flex items-center justify-center gap-3
      bg-black border border-slate-700
      rounded-lg text-white text-sm font-semibold
      hover:bg-slate-900 transition
    ">
      {text}
    </button>
  );
}
