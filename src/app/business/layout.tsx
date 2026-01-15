"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import BusinessHeader from "@/components/(Business)/layout/BusinessHeader";
import { useAuth } from "@/providers/authProvider";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, token, logout, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait for auth loading to complete
    if (isLoading) return;

    if (!isAuthenticated || !token) {
      router.replace("/login");
      return;
    }

    try {
      // Decode JWT to check expiration and role
      const payload = JSON.parse(atob(token.split('.')[1]));

      // 1. Check Token Expiration
      // exp is in seconds, Date.now() is in milliseconds
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expired
        logout();
        router.replace("/login");
        return;
      }

      // 2. Check Business Role
      // Assuming role is stored in 'role' or 'roles' claim
      const userRole = payload.role || payload.roles || "";
      const isBusiness = payload.isBusiness === 'True' || payload.isBusiness === true;
      const isAdmin = payload.isAdmin === 'True' || payload.isAdmin === true;

      const hasBusinessAccess = isBusiness || isAdmin;

      if (!hasBusinessAccess) {
        // User is logged in but not a business user
        router.replace("/"); // Redirect to main home
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
      router.replace("/login");
    }
  }, [isAuthenticated, token, isLoading, router, logout]);

  // Prevent flashing content before auth check
  if (isLoading || !isAuthorized) {
    return null; // Or return a loading spinner if preferred
  }

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
