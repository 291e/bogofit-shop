"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  const hasSubSections = mainSection.subSections && mainSection.subSections.length > 0;
  
  // Check if any subsection is active
  const isActive = mainSection.subSections?.some(sub => sub.href && pathname === sub.href) || false;

  return (
    <div className={cn("bg-white border-r border-gray-200", className)}>
      <div className="border-b border-red-500 h-1"></div>
      
      <div className="py-2">
        {/* Main Section Header */}
        <div
          className={cn(
            "flex items-center justify-between py-3 px-4 cursor-pointer transition-colors",
            isActive 
              ? "bg-blue-100 text-blue-900 font-medium border-b border-blue-200" 
              : "bg-gray-100 text-gray-900 font-medium border-b border-gray-200"
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
              const isSubActive = pathname === subSection.href;
              return (
                <Link
                  key={subSection.id}
                  href={subSection.href || "#"}
                  className={cn(
                    "flex items-center justify-between py-3 px-4 cursor-pointer transition-colors pl-8",
                    isSubActive 
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500" 
                      : "hover:bg-gray-50 text-gray-700"
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
