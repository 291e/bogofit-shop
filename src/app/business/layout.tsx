"use client";

import { usePathname } from "next/navigation";
import BusinessHeader from "@/components/(Business)/layout/BusinessHeader";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Only show sidebar on business/brands/[id] pages
  const shouldShowSidebar = pathname.startsWith("/business/brands/") && pathname !== "/business/brands";

  if (!shouldShowSidebar) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader />

      <div className="flex min-h-screen">

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
