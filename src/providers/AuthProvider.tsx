import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApolloClient } from "@apollo/client";
import { User } from "@/graphql/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const client = useApolloClient();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 쿠키 기반 사용자 정보 가져오기
  const { data, isLoading, refetch } = useQuery<{ user: User }>({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include", // 쿠키 포함
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch user");
      }

      const result = await response.json();
      return { user: result.user };
    },
    enabled: mounted,
    staleTime: 1000 * 60 * 5, // 5분
    retry: (failureCount, error) => {
      // 401 에러는 재시도하지 않음
      if (error?.message === "Unauthorized") {
        return false;
      }
      return failureCount < 2;
    },
    initialData: initialUser ? { user: initialUser } : undefined,
  });

  const user = data?.user || null;

  const login = (userData: User) => {
    // 사용자 데이터를 즉시 캐시에 설정
    queryClient.setQueryData(["auth", "user"], { user: userData });

    // 백그라운드에서 최신 정보 가져오기
    setTimeout(() => {
      refetch();
    }, 100);
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    } finally {
      // 클라이언트 상태 완전 초기화
      queryClient.clear(); // React Query 캐시 완전 삭제
      client.clearStore(); // Apollo 캐시 완전 삭제

      // 페이지 강제 새로고침으로 모든 상태 초기화
      window.location.href = "/";
    }
  };

  const refetchUser = () => {
    refetch();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
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
