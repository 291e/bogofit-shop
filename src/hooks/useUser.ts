import { useQuery } from "@tanstack/react-query";
import { User } from "@/graphql/types";
import { GET_MY_INFO } from "@/graphql/queries";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useApolloClient } from "@apollo/client";

export function useUser() {
  const client = useApolloClient();
  const { setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const upsertedUserIds = useRef<Set<string>>(new Set()); // 업서트된 사용자 ID 추적

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

  // 사용자 정보가 변경될 때 Zustand 상태 업데이트 및 사용자별 1회만 업서트
  useEffect(() => {
    if (data?.user && data.user.id) {
      const token = localStorage.getItem("token");
      setAuth(data.user, token);

      // 해당 사용자 ID로 업서트가 이미 되었는지 확인
      if (!upsertedUserIds.current.has(data.user.id)) {
        upsertedUserIds.current.add(data.user.id);

        // 비동기적으로 업서트 실행 (UI 블로킹 방지)
        fetch("/api/user/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.user),
        }).catch((error) => {
          console.error("사용자 업서트 실패:", error);
          // 실패 시 다시 시도할 수 있도록 Set에서 제거
          upsertedUserIds.current.delete(data.user.id);
        });
      }
    }
  }, [data?.user?.id, setAuth]); // data?.user?.id로 의존성 변경

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
