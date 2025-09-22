import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/axiosConfig";
import { useMessage } from "./MessageModalProvider";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const message = useMessage();

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      message.error(error.response?.data?.message || "Something went wrong.");
    }
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await apiClient.get("/auth/session");
        setUser(response.data.user);
      } catch (error) {
        if (error.response?.status !== 401) {
          message.error(
            error.response?.data?.message || "Something went wrong."
          );
        }
        if (error.response?.status === 403) {
          logout();
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      const { user } = response.data;
      setUser(user);
      navigate("/");
      message.success(response?.data?.message || "Success");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
