import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    const username = localStorage.getItem("userName");

    if (token && role) {
      setUser({ username, role });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post("/token/", { username, password });
    const { access, refresh, role, id, email } = response.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user_role", role);
    localStorage.setItem("userName", username);
    localStorage.setItem("isLoggedin", "true");

    setUser({ id, username, email, role });
    return response.data;
  };

  const signup = async (username, email, password) => {
    const response = await api.post("/signup/", { username, email, password });
    return response.data;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        await api.post("/logout/", { refresh });
      }
    } catch (err) {
      console.warn("Logout API call failed (token may already be invalid):", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("userName");
      localStorage.removeItem("isLoggedin");
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, isAuthenticated, role }}
    >
      {children}
    </AuthContext.Provider>
  );
};
