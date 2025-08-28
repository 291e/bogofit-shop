"use client";

import { Suspense } from "react";
import OrderPageContent from "./OrderPageContent";

// 로딩 컴포넌트
function OrderPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
        <p className="text-gray-600">주문 페이지를 준비중입니다...</p>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<OrderPageLoading />}>
      <OrderPageContent />
    </Suspense>
  );
}
