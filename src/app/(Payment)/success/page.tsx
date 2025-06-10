import { Suspense } from "react";
import SuccessPageClient from "./SuccessPageClient";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SuccessPageClient />
    </Suspense>
  );
}
