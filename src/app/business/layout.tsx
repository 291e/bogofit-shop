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

  // If we are in the dashboard (where sidebar is shown), delegate layout to the child layout
  if (shouldShowSidebar) {
    return <>{children}</>;
  }

  // For other pages (like brand list), show header and content
  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
