import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { User, Mail, Lock, AlertCircle, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";

export default function SignUpForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Auto login after signup if needed

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      const result = await registerUser({
        fullName,
        email,
        password,
        username: email.split("@")[0], // Simple username generation
      });

      // Optional: Auto login or redirect to login
      // Login flow:
      login(result.user, result.token);
      navigate("/dashboard");

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6" autoComplete="off">

      {/* Full Name Input */}
      <div className="space-y-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-300" />
          </div>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 
                     focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 focus:ring-4 focus:ring-blue-500/10 
                     transition-all duration-300 font-medium"
            required
          />
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-300" />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 
                     focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 focus:ring-4 focus:ring-blue-500/10 
                     transition-all duration-300 font-medium"
            required
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-300" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 pl-12 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 
                     focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 focus:ring-4 focus:ring-blue-500/10 
                     transition-all duration-300 font-medium"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Password Strength Indicator (Simplified) */}
        {password && (
          <div className="flex gap-1 h-1 mt-2">
            <div className={`h-full rounded-full transition-all duration-300 flex-1 ${password.length > 0 ? "bg-red-500" : "bg-gray-700"}`} />
            <div className={`h-full rounded-full transition-all duration-300 flex-1 ${password.length >= 8 ? "bg-yellow-500" : "bg-gray-700"}`} />
            <div className={`h-full rounded-full transition-all duration-300 flex-1 ${password.length >= 10 ? "bg-green-500" : "bg-gray-700"}`} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3 backdrop-blur-sm"
          >
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 
                 rounded-xl text-white font-bold tracking-wide shadow-lg shadow-blue-500/20 
                 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] 
                 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                 flex items-center justify-center gap-2 relative overflow-hidden group"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span className="animate-pulse">Creating Account...</span>
          </>
        ) : (
          <>
            <span>Join OrbitDev</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}
