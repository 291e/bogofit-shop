"use client";

import { useEffect, useState } from "react";

interface FailPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function FailPage({ searchParams }: FailPageProps) {
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const params = await searchParams;
      const code = params.code as string;
      const message = params.message as string;

      if (code && message) {
        setErrorMessage(`${message} (에러 코드: ${code})`);
      }
    };

    getParams();
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">결제 실패</h1>
        <div className="space-y-4">
          <p className="text-red-500">{errorMessage}</p>
          <p className="text-sm text-gray-500">
            결제가 실패했습니다. 다시 시도해주세요.
          </p>
        </div>
      </div>
    </main>
  );
}
