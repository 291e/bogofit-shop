"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // SSR과 CSR 간의 일관성을 위한 설정
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5분
          },
        },
      })
  );

  // hydration 불일치 문제 해결을 위한 효과
  useEffect(() => {
    // 클라이언트 사이드에서 마운트 후 캐시 초기화
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // 페이지가 다시 보일 때 필요한 쿼리만 무효화
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    };

    // 페이지 가시성 변화 감지
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
