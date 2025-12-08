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
  theme?: 'dark' | 'light';
}

export default function SideBarSection({
  mainSection,
  className,
  theme = 'dark',
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

  const isDark = theme === 'dark';

  return (
    <div className={cn("", className)}>

      <div>
        {/* Main Section Header */}
        <div
          className={cn(
            "flex items-center justify-between py-3 px-4 cursor-pointer transition-all",
            isActive
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg"
              : cn(
                "font-medium transition-colors",
                isDark
                  ? "text-gray-300 hover:bg-gray-700/50"
                  : "text-gray-600 hover:bg-gray-100"
              )
          )}
          onClick={() => hasSubSections && toggleSection()}
        >
          <div className="flex items-center gap-2">
            {hasSubSections && (
              <div className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className={cn("w-3 h-3", isActive ? "text-white" : (isDark ? "text-gray-400" : "text-gray-500"))} />
                ) : (
                  <ChevronRight className={cn("w-3 h-3", isActive ? "text-white" : (isDark ? "text-gray-400" : "text-gray-500"))} />
                )}
              </div>
            )}
            <span className="text-sm font-semibold">
              {mainSection.label}
            </span>
          </div>

          {mainSection.count !== undefined && (
            <div className={cn(
              "text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-medium",
              isActive
                ? "bg-white/20 text-white"
                : (isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600")
            )}>
              {mainSection.count}
            </div>
          )}
        </div>

        {/* Sub Sections */}
        {hasSubSections && isExpanded && (
          <div className={cn(
            "transition-colors",
            isDark ? "bg-gray-800/50" : "bg-gray-50"
          )}>
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
                    "flex items-center justify-between py-2 px-4 cursor-pointer transition-all pl-8",
                    isSubActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 border-l-4 border-blue-500 font-medium"
                      : cn(
                        "transition-colors",
                        isDark
                          ? "text-gray-400 hover:bg-gray-700/30 hover:text-gray-200"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      )
                  )}
                >
                  <span className={cn("text-sm font-normal", isSubActive && isDark && "text-blue-300")}>
                    {subSection.label}
                  </span>

                  {subSection.count !== undefined && (
                    <div className={cn(
                      "text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-medium",
                      isSubActive
                        ? "bg-blue-500/30 text-blue-600"
                        : (isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"),
                      isSubActive && isDark && "text-blue-200"
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
