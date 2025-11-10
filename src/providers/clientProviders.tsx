"use client";

import { ReactQueryProvider } from "./reactQueryProvider";
import { AuthProvider } from "./authProvider";
import { LanguageProvider } from "./languageProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
