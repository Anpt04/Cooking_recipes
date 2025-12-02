import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, userAPI } from "../services/api";
import { Navigate } from "react-router-dom";

interface User {
  user_id: number;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { username: string; email: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy token và user từ localStorage khi app khởi động
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const cachedUser = localStorage.getItem("user");

      if (cachedUser && cachedUser !== "undefined") {
        setUser(JSON.parse(cachedUser));
      }

      if (token) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to restore user session:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setLoading(false);
    }
  }, []);

  // ✅ Đồng bộ user với localStorage mỗi khi user thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await userAPI.getProfile();
      setUser(data); // ✅ data chính là user object
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);

      // ✅ chỉ xóa token nếu lỗi 401
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };


  const login = async (email: string, password: string) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async (registerData: { username: string; email: string; password: string; full_name?: string }) => {
    const data = await authAPI.register(registerData);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); 
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>⏳ Checking permission...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "admin") return <Navigate to="/" replace />;

  return <>{children}</>;
};
