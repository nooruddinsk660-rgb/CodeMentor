import { Link, useNavigate } from "react-router-dom";
import { logout, isAuthenticated } from "../../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-[#223049] px-4 sm:px-10 py-3">
      {/* Logo */}
      <div className="flex items-center gap-3 text-white">
        <div className="size-6 text-primary">
          {/* SVG unchanged */}
          <svg
            fill="currentColor"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-primary"
          >
            <path d="M24 4c-5.13 0-9.87.72-13.39 1.94C8.75 7.06 7.2 7.83 6.1 8.76 4.97 9.72 4 11.06 4 12.76c0 .8.29 1.62.54 2.2l.06.14 17.32 27.21c.38.6 1.34.6 1.72 0L43.94 15c.02-.03.03-.06.05-.09.3-.56.56-1.35.56-2.14 0-1.7-.97-3.04-2.1-4-1.1-.93-2.65-1.7-4.51-2.32C33.87 4.72 29.13 4 24 4Z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold">CodeMentor</h2>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        <nav className="flex gap-8">
          <Link to="/#features" className="text-[#90a6cb] hover:text-white">
            Features
          </Link>
          <Link to="/#testimonials" className="text-[#90a6cb] hover:text-white">
            Testimonials
          </Link>
          <Link to="/#pricing" className="text-[#90a6cb] hover:text-white">
            Pricing
          </Link>
        </nav>

        {/* Auth Actions */}
        {!loggedIn ? (
          <button
            onClick={() => navigate("/login")}
            className="px-4 h-10 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 h-10 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
