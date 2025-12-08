import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthUser, AuthContextType } from "../types/auth";
import { apiClient } from "../services/apiClient";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.login(email, password);

      // Backend trả về: { user, accessToken, refreshToken }
      // apiClient đã chuẩn hóa vào response.data
      const data = response.data;

      if (!data || !data.accessToken || !data.user) {
        throw new Error("Invalid response from server");
      }

      // 🔒 QUAN TRỌNG: Chặn nếu không phải Admin
      if (data.user.role !== "admin") {
        throw new Error("Access Denied: You are not an Admin.");
      }

      apiClient.setToken(data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (err: any) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.clearToken();
    localStorage.removeItem("user");
    setUser(null);
    setError(null);
    // Redirect về login (thường xử lý ở Router, nhưng thêm ở đây cho chắc)
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
