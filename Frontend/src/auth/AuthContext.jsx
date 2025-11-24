import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromToken = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const payload = jwtDecode(token);
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        throw new Error("Token expired");
      }
      
      setUser({ id: payload._id || payload.id, role: payload.role, email: payload.email });
    } catch (error) {
      console.warn("Invalid or expired token:", error);
      localStorage.removeItem("accessToken"); // Clean up bad token
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run once on mount
  useEffect(() => {
    loadUserFromToken();
    setLoading(false);
  }, [loadUserFromToken]);

  const login = useCallback((token) => {
    localStorage.setItem("accessToken", token);
    loadUserFromToken();
  }, [loadUserFromToken]);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return (
    <AuthCtx.Provider value={value}>
      {/* Only render the app after the token check is complete */}
      {!loading && children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);