import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const processedRef = useRef(false); // Prevent double execution in React StrictMode

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      // 1. Fetch user details using the new token
      fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // 2. Login via Context
            login({ user: data.data, token });
            navigate("/dashboard");
          } else {
            console.error("Failed to fetch user data");
            navigate("/login?error=auth_failed");
          }
        })
        .catch((err) => {
          console.error(err);
          navigate("/login?error=server_error");
        });
    } else if (error) {
      navigate(`/login?error=${error}`);
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Authenticating with GitHub...</p>
      </div>
    </div>
  );
}