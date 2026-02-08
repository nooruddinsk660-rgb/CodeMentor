import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginUser, registerUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Restore session and validate token
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          // Verify token validity on mount
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.data);
            setToken(storedToken);
          } else {
            // Token expired - clear storage
            console.warn("Session expired on init");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth verification failed:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setError("Session expired. Please login again.");
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ✅ Intercept API calls to handle token expiration
  useEffect(() => {
    if (!token) return;

    const interceptor = async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        console.warn("Unauthorized access - logging out");
        logout();
        window.location.href = '/login?session=expired';
      }

      return response;
    };

    window.authFetch = interceptor;
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      // Pass object because service expects credential object
      const response = await loginUser({ email, password });

      const { user, token } = response;

      setUser(user);
      setToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      return user;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      setError(null);
      // Pass object matching backend expectation
      const response = await registerUser({ username: name, email, password });
      const { user, token } = response;

      setUser(user);
      setToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      return user;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = '/login';
    }
  }, [token]);

  const updateUser = useCallback((updatedData) => {
    setUser(updatedData);
    localStorage.setItem("user", JSON.stringify(updatedData));
  }, []);

  const loginWithGithub = useCallback(() => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  }, []);

  const setAuth = useCallback((user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        loginWithGithub,
        setAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);