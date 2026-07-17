import { createContext, useContext, useEffect, useState } from "react";
import { authApi, tokenStore } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(tokenStore.getUser());
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, confirm it's still valid by
  // hitting the protected /me/ endpoint (this also refreshes stale user data).
  useEffect(() => {
    const access = tokenStore.getAccess();
    if (!access) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((data) => {
        setUser(data);
        tokenStore.save({ user: data });
      })
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data.user;
  };

  const register = (payload) => authApi.register(payload);

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
