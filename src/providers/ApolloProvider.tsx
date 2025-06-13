"use client";

import { ApolloProvider } from "@apollo/client";
import { useState, useEffect } from "react";
import client, { initializeApollo } from "@/lib/apolloClient";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 마운트 상태 변경
  useEffect(() => {
    setMounted(true);
  }, []);

  // 서버 사이드에서는 기본 클라이언트 사용
  // 클라이언트 사이드에서는 마운트 후에 클라이언트 초기화
  const apolloClient = mounted ? initializeApollo() : client;

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
