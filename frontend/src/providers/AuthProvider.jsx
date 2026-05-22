import { createContext, useContext, useMemo, useState } from "react";

import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("rw_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem("rw_user");
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(false);

  const DEMO_USER = { id: "demo-001", full_name: "Demo Admin", email: "demo@roadwatch.city", role: "government_admin" };

  async function login(payload) {
    setAuthLoading(true);
    try {
      // Demo bypass: accept demo@roadwatch.city / demo123
      if (payload.email === "demo@roadwatch.city" && payload.password === "demo123") {
        localStorage.setItem("rw_user", JSON.stringify(DEMO_USER));
        setUser(DEMO_USER);
        return DEMO_USER;
      }
      const result = await api.login(payload);
      localStorage.setItem("rw_access_token", result.tokens.access_token);
      localStorage.setItem("rw_refresh_token", result.tokens.refresh_token);
      localStorage.setItem("rw_user", JSON.stringify(result.user));
      setUser(result.user);
      return result.user;
    } finally {
      setAuthLoading(false);
    }
  }

  async function signup(payload) {
    setAuthLoading(true);
    try {
      const result = await api.signup(payload);
      localStorage.setItem("rw_access_token", result.tokens.access_token);
      localStorage.setItem("rw_refresh_token", result.tokens.refresh_token);
      localStorage.setItem("rw_user", JSON.stringify(result.user));
      setUser(result.user);
      return result.user;
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("rw_access_token");
    localStorage.removeItem("rw_refresh_token");
    localStorage.removeItem("rw_user");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      authLoading,
      login,
      signup,
      logout,
    }),
    [user, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
