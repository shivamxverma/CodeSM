import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { LOCAL_STORAGE_KEY } from "@/utils/local-storage-key";
import { getCurrentUser } from "@/api/api";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromToken = useCallback((token) => {
    if (!token) return null;

    try {
      const payload = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        throw new Error("Token expired");
      }

      return {
        id: payload.userId || payload._id || payload.id,
        role: payload.role,
        email: payload.email,
        username: payload.username,
      };
    } catch (error) {
      console.warn("Invalid or expired token:", error);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      // If /me fails, we check for a token as fallback
      const token = localStorage.getItem(LOCAL_STORAGE_KEY.AUTH);
      if (token) {
        const decodedUser = loadUserFromToken(token);
        if (decodedUser) {
          setUser(decodedUser);
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_KEY.AUTH);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [loadUserFromToken]);

  useEffect(() => {
    refreshUser();

    const handleStorageChange = (e) => {
      if (e.key === LOCAL_STORAGE_KEY.AUTH) {
        refreshUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshUser]);

  const login = useCallback(
    (tokenOrUser) => {
        if (typeof tokenOrUser === "string") {
            localStorage.setItem(LOCAL_STORAGE_KEY.AUTH, tokenOrUser);
            const decodedUser = loadUserFromToken(tokenOrUser);
            if (decodedUser) {
                setUser(decodedUser);
            } else {
                refreshUser();
            }
        } else if (tokenOrUser && typeof tokenOrUser === "object") {
             setUser(tokenOrUser);
             if (tokenOrUser.accessToken) {
                 localStorage.setItem(LOCAL_STORAGE_KEY.AUTH, tokenOrUser.accessToken);
             }
        }
    },
    [loadUserFromToken, refreshUser],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY.AUTH);
    localStorage.removeItem(LOCAL_STORAGE_KEY.IS_LOGGED_IN);
    setUser(null);
  }, []);

  const startGoogleRedirect = useCallback(() => {
    const origin = window.location.origin;
    const API = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
    if (!API) {
      console.error("VITE_API_URL is not defined");
      return;
    }
    const url = `${API}/auth/google?origin=${encodeURIComponent(origin)}`;
    window.location.href = url;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, startGoogleRedirect, refreshUser }),
    [user, loading, login, logout, startGoogleRedirect, refreshUser]
  );

  return (
    <AuthCtx.Provider value={value}>
      {!loading && children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);