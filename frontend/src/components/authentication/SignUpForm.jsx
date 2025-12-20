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

      await registerUser({
        fullName,
        email,
        password,
        username: email.split("@")[0], // backend requires username
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TextInput
        label="Full Name"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <TextInput
        label="Email address"
        type="email"
        placeholder="name@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary rounded-lg text-white font-semibold disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
