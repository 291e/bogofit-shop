import { Suspense } from "react";
import { SalePageClient } from "./SalePageClient";

export default function SalePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<div>Loading...</div>}>
                <SalePageClient />
            </Suspense>
        </div>
    );
}
