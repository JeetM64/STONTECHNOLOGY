import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

// Create context
export const AuthContext = createContext();

// Create Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error("Failed to parse stored user session:", err);
        // Clear corrupt storage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login action calling backend authentication endpoint
   * Saves credentials to local state and local storage
   */
  const loginUser = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: userToken, ...userData } = response.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userToken);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid email or password";
      return { success: false, error: message };
    }
  };

  /**
   * Logout action clearing state and deleting stored tokens
   */
  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
