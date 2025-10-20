"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const message = searchParams.get("message");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full">
        <CardContent className="p-12 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">결제 실패</h2>
          <p className="text-gray-600 mb-2">결제 처리 중 오류가 발생했습니다</p>
          {message && (
            <p className="text-sm text-gray-500 mb-6">{decodeURIComponent(message)}</p>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.back()} 
              className="w-full"
            >
              다시 시도
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/")}
              className="w-full"
            >
              홈으로
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">결제 실패</h2>
            <p className="text-gray-600 mb-2">결제 처리 중 오류가 발생했습니다</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}

