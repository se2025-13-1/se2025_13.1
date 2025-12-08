// src/types/auth.ts

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "staff" | "customer";
  full_name?: string;
  avatar_url?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
