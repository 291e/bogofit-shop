import { useQuery } from "@tanstack/react-query";
import { User } from "@/graphql/types";
import { GET_MY_INFO } from "@/graphql/queries";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useApolloClient } from "@apollo/client";

export function useUser() {
  const client = useApolloClient();
  const { setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // React Query를 사용하여 사용자 정보 가져오기
  const { data, isLoading, error, refetch } = useQuery<{ user: User }>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(token ? "있음" : "없음");

        // Apollo Client를 사용하여 GraphQL 쿼리 실행
        const result = await client.query({
          query: GET_MY_INFO,
          fetchPolicy: "network-only", // 항상 최신 데이터 가져오기
        });

        return { user: result.data.getMyInfo };
      } catch (err) {
        throw err;
      }
    },
    // 마운트 후 로컬 스토리지에 토큰이 있을 때만 쿼리 실행
    enabled:
      mounted &&
      typeof window !== "undefined" &&
      !!localStorage.getItem("token"),
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터 유지
    retry: false, // 인증 실패 시 재시도 안 함
  });

  // 사용자 정보가 변경될 때 Zustand 상태 업데이트
  useEffect(() => {
    if (data?.user) {
      const token = localStorage.getItem("token");

      setAuth(data.user, token);

      // 상태 업데이트 후 약간의 지연을 두고 확인
      setTimeout(() => {}, 100);
    }
  }, [data, setAuth]);

  // 사용자 정보 업데이트 함수
  const updateUser = async (newUser: User) => {
    // Zustand 상태 업데이트
    const token = localStorage.getItem("token");
    setAuth(newUser, token);

    // React Query 캐시 업데이트
    await refetch();
  };

  return {
    user: data?.user,
    loading: isLoading,
    error,
    setUser: updateUser,
    refetch,
  };
}
