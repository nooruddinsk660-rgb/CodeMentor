import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import TextInput from "./input/TextInput";
import PasswordInput from "./input/PasswordInput";

export default function SignUpForm() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("REGISTER PAYLOAD", {
        fullName,
        email,
        password,
        username: email.split("@")[0],
      });

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      await registerUser({
        fullName,
        email,
        password,
        username: email.split("@")[0],
      });

      // After successful signup → login page
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {/* Full Name */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-gray-500 group-focus-within:text-blue-400 transition-colors">person</span>
        </div>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-blue-900/10 transition-all font-medium"
          required
          autoComplete="off"
        />
      </div >

      {/* Email */}
      < div className="relative group" >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-gray-500 group-focus-within:text-blue-400 transition-colors">mail</span>
        </div>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-blue-900/10 transition-all font-medium"
          required
          autoComplete="off"
        />
      </div >

      {/* Password */}
      < div className="relative group" >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-gray-500 group-focus-within:text-blue-400 transition-colors">lock</span>
        </div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-blue-900/10 transition-all font-medium"
          required
          autoComplete="new-password"
        />
      </div >

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )
      }

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white font-bold tracking-wide hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            Registering Identity...
          </>
        ) : (
          <>
            Create DevOS ID <span className="material-symbols-outlined text-lg">person_add</span>
          </>
        )}
      </button>
    </form >
  );
}
