"use client";

import { ReactQueryProvider } from "./reactQueryProvider";
import { AuthProvider } from "./authProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ReactQueryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ReactQueryProvider>
    </ErrorBoundary>
  );
}
