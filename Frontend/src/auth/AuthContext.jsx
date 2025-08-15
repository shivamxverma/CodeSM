import { createContext, useContext, useMemo, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return setUser(null);
    try {
      const payload = jwtDecode(token);
      setUser({ id: payload._id, role: payload.role });
    } catch {
      setUser(null);
    }
  }, []);

  return <AuthCtx.Provider value={{ user }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);