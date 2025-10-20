"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 phút
            staleTime: 5 * 60 * 1000,
            // Cache time: 10 phút
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 1 lần
            retry: 1,
            // Không refetch khi window focus (tránh spam API)
            refetchOnWindowFocus: false,
            // Refetch on mount nếu data đã stale
            refetchOnMount: true,
            // ✅ Fix Next.js 15 + Turbopack compatibility
            refetchOnReconnect: false,
            networkMode: 'online',
          },
          mutations: {
            // Retry mutations 0 lần
            retry: 0,
            // ✅ Fix Next.js 15 + Turbopack compatibility
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Chỉ hiển thị devtools trong development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
