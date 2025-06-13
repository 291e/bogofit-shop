"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useApolloClient } from "@apollo/client";
import { GET_MY_INFO } from "@/graphql/queries";
import { User } from "@/graphql/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const client = useApolloClient();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // React Query로 사용자 정보 가져오기
  const { data, isLoading, refetch } = useQuery<{ user: User }>({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const result = await client.query({
        query: GET_MY_INFO,
        fetchPolicy: "network-only",
      });

      return { user: result.data.getMyInfo };
    },
    enabled:
      mounted &&
      typeof window !== "undefined" &&
      !!localStorage.getItem("token"),
    staleTime: 1000 * 60 * 5, // 5분
    retry: false,
  });

  // 사용자 정보 업데이트
  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    } else if (!isLoading && mounted) {
      setUser(null);
    }
  }, [data, isLoading, mounted]);

  const login = (token: string, userData?: User) => {
    localStorage.setItem("token", token);
    if (userData) {
      setUser(userData);
    }
    // 토큰 저장 후 사용자 정보 다시 가져오기
    setTimeout(() => {
      refetch();
    }, 100);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // Apollo 캐시 초기화
    client.clearStore();
  };

  const refetchUser = () => {
    refetch();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!localStorage.getItem("token"),
    isLoading: isLoading && mounted,
    login,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
