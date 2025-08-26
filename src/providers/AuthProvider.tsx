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
import { LOGIN } from "@/graphql/mutations";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  loginWithCredentials: (
    userId: string,
    password: string,
    isBusiness?: boolean
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
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

  const loginWithCredentials = async (
    userId: string,
    password: string,
    isBusiness: boolean = false
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      console.log("[AuthProvider] 로그인 시도:", { userId, isBusiness });

      // 1단계: 자체 로그인 시도
      const directLoginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          password,
          isBusiness,
        }),
      });

      const directLoginResult = await directLoginResponse.json();

      // 자체 로그인 성공
      if (directLoginResponse.ok) {
        console.log("[AuthProvider] 자체 로그인 성공");
        const userData = directLoginResult.user;
        login(userData);
        return { success: true, user: userData };
      }

      // GraphQL 로그인이 필요한 경우
      if (directLoginResult.error === "GRAPHQL_LOGIN_REQUIRED") {
        console.log("[AuthProvider] GraphQL 로그인 시도");

        try {
          // 2단계: GraphQL 로그인 시도
          const graphqlResult = await client.mutate({
            mutation: LOGIN,
            variables: {
              userId,
              password,
              deviceId: null, // 사업자 로그인은 deviceId 불필요
            },
          });

          console.log(
            "[AuthProvider] GraphQL 로그인 응답:",
            graphqlResult.data?.login
          );

          if (
            graphqlResult.data?.login?.success &&
            graphqlResult.data?.login?.token
          ) {
            // 3단계: GraphQL 토큰으로 자체 JWT 생성
            const jwtResponse = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                userId: userId, // 원본 userId 전달
                password: "graphql",
                graphqlToken: graphqlResult.data.login.token,
                isBusiness,
              }),
            });

            const jwtResult = await jwtResponse.json();

            if (jwtResponse.ok) {
              console.log("[AuthProvider] GraphQL 토큰 로그인 성공");
              const userData = jwtResult.user;
              login(userData);
              return { success: true, user: userData };
            } else {
              console.error(
                "[AuthProvider] GraphQL 토큰 로그인 실패:",
                jwtResult
              );
              return {
                success: false,
                error: jwtResult.error || "GraphQL 토큰 로그인 실패",
              };
            }
          } else {
            console.error(
              "[AuthProvider] GraphQL 로그인 실패:",
              graphqlResult.data?.login
            );
            return {
              success: false,
              error:
                graphqlResult.data?.login?.message || "GraphQL 로그인 실패",
            };
          }
        } catch (graphqlError) {
          console.error("[AuthProvider] GraphQL 로그인 오류:", graphqlError);
          return {
            success: false,
            error: "GraphQL 로그인 중 오류가 발생했습니다",
          };
        }
      }

      // 기타 오류
      console.error("[AuthProvider] 로그인 실패:", directLoginResult);
      return {
        success: false,
        error: directLoginResult.error || "로그인 실패",
      };
    } catch (error) {
      console.error("[AuthProvider] 로그인 처리 중 오류:", error);
      return { success: false, error: "로그인 처리 중 오류가 발생했습니다" };
    }
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
    loginWithCredentials,
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
