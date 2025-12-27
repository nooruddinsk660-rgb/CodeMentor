import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore session and validate token
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          // ✅ CRITICAL: Verify token is still valid on mount
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
            // Token expired or invalid - clear storage
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth verification failed:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
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

      // ✅ Auto-logout on 401 (token expired)
      if (response.status === 401) {
        logout();
        window.location.href = '/login?session=expired';
      }

      return response;
    };

    // Attach to window for global use (optional)
    window.authFetch = interceptor;
  }, [token]);

  const login = ({ user, token }) => {
    setUser(user);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  const logout = async () => {
    try {
      // ✅ Call backend logout endpoint
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);