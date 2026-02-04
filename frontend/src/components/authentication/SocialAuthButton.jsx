// frontend/src/components/authentication/SocialAuthButton.jsx
import { Github } from "lucide-react";

export default function SocialAuthButton({ text }) {
  const handleLogin = () => {
    // Redirect to Backend API to start OAuth flow
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="
      w-full h-12 flex items-center justify-center gap-3
      bg-[#24292F] hover:bg-[#2c313a] 
      border border-white/10 hover:border-white/20
      rounded-xl text-white font-medium transition-all duration-300
      shadow-lg hover:shadow-xl hover:-translate-y-0.5
      group
    ">
      <Github size={20} className="text-white group-hover:scale-110 transition-transform" />
      <span>{text}</span>
    </button>
  );
}