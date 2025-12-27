// frontend/src/components/authentication/SocialAuthButton.jsx
export default function SocialAuthButton({ text }) {
  const handleLogin = () => {
    // Redirect to Backend API to start OAuth flow
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  };

  return (
    <button 
      type="button" // Important so it doesn't submit forms if inside one
      onClick={handleLogin}
      className="
      w-full h-11 flex items-center justify-center gap-3
      bg-[#24292F] border border-slate-700
      rounded-lg text-white text-sm font-semibold
      hover:bg-[#2c313a] transition shadow-lg
    ">
      <img src="https://cdn.simpleicons.org/github/white" className="w-5 h-5" alt="GitHub" />
      {text}
    </button>
  );
}