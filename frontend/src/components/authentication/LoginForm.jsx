import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";

export default function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({ email, password });

      // 🔐 Save token
      localStorage.setItem("token", result.token);
       console.log("LOGIN SUCCESS, REDIRECTING");

      // ✅ Redirect
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 rounded-lg bg-slate-800 border border-slate-700 px-4 text-white"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-11 rounded-lg bg-slate-800 border border-slate-700 px-4 text-white"
        required
      />

      {error && (
        <p className="text-sm text-red-500 font-medium">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary rounded-lg text-white font-semibold disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
