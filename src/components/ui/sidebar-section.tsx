"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface SubSectionItem {
  id: string;
  label: string;
  href?: string;
  count?: number;
}

interface MainSectionItem {
  id: string;
  label: string;
  href?: string;
  count?: number;
  subSections?: SubSectionItem[];
}

interface SideBarSectionProps {
  mainSection: MainSectionItem;
  className?: string;
}

export default function SideBarSection({
  mainSection,
  className,
}: SideBarSectionProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  const hasSubSections = mainSection.subSections && mainSection.subSections.length > 0;

  // Check if any subsection is active (including query params)
  const isActive = mainSection.subSections?.some(sub => {
    if (!sub.href) return false;

    // For "all-orders" - only active when on orders page with no status or status=all
    if (sub.id === 'all-orders') {
      const currentStatus = searchParams.get('status');
      return pathname.includes('/orders') && (!currentStatus || currentStatus === 'all');
    }

    // For status-specific items - only active when pathname matches and status matches
    if (sub.href.includes('?')) {
      const [basePath, queryString] = sub.href.split('?');
      if (pathname === basePath) {
        const urlParams = new URLSearchParams(queryString);
        const statusParam = urlParams.get('status');
        const currentStatus = searchParams.get('status');
        return statusParam === currentStatus;
      }
      return false; // Not on the right path
    }

    // Exact pathname match for other cases
    return pathname === sub.href;
  }) || false;

  return (
    <div className={cn("", className)}>

      <div>
        {/* Main Section Header */}
        <div
          className={cn(
            "flex items-center justify-between py-3 px-4 cursor-pointer transition-colors hover:bg-gray-50",
            isActive
              ? "bg-blue-50 text-blue-900 font-medium"
              : "text-gray-700 font-medium"
          )}
          onClick={() => hasSubSections && toggleSection()}
        >
          <div className="flex items-center gap-2">
            {hasSubSections && (
              <div className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )}
              </div>
            )}
            <span className="text-sm font-semibold">
              {mainSection.label}
            </span>
          </div>

          {mainSection.count !== undefined && (
            <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
              {mainSection.count}
            </div>
          )}
        </div>

        {/* Sub Sections */}
        {hasSubSections && isExpanded && (
          <div className="bg-white">
            {mainSection.subSections!.map((subSection) => {
              // Check if subsection is active (including query params)
              const isSubActive = (() => {
                if (!subSection.href) return false;

                // For "all-orders" - only active when on orders page with no status or status=all
                if (subSection.id === 'all-orders') {
                  const currentStatus = searchParams.get('status');
                  return pathname.includes('/orders') && (!currentStatus || currentStatus === 'all');
                }

                // For status-specific items - only active when pathname matches and status matches
                if (subSection.href.includes('?')) {
                  const [basePath, queryString] = subSection.href.split('?');
                  if (pathname === basePath) {
                    const urlParams = new URLSearchParams(queryString);
                    const statusParam = urlParams.get('status');
                    const currentStatus = searchParams.get('status');
                    return statusParam === currentStatus;
                  }
                  return false; // Not on the right path
                }

                // Exact pathname match for other cases
                return pathname === subSection.href;
              })();

              return (
                <Link
                  key={subSection.id}
                  href={subSection.href || "#"}
                  className={cn(
                    "flex items-center justify-between py-2 px-4 cursor-pointer transition-colors pl-8 hover:bg-gray-50",
                    isSubActive
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 font-medium"
                      : "text-gray-600"
                  )}
                >
                  <span className="text-sm font-normal">
                    {subSection.label}
                  </span>

                  {subSection.count !== undefined && (
                    <div className={cn(
                      "text-xs px-2 py-1 rounded-full min-w-[20px] text-center",
                      isSubActive
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-600"
                    )}>
                      {subSection.count}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
