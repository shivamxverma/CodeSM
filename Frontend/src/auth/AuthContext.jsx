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
      return;
    }
    try {
      const payload = jwtDecode(token);
      setUser({ id: payload._id, role: payload.role });
    } catch {
      setUser(null);
    }
  }, []);

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

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);