"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  businessMenuItems,
  type MenuItem,
} from "@/contents/Business/menuItems";

export default function BusinessSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "상품 관리", // 기본적으로 상품 관리는 열어두기
    "주문 관리", // 기본적으로 주문 관리도 열어두기
    "통계 및 분석", // 기본적으로 통계 분석도 열어두기
  ]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string, item?: MenuItem) => {
    if (href === "/business") {
      return pathname === href;
    }

    // children이 있는 메뉴의 경우, 현재 경로가 children 중 하나와 일치하는지 확인
    if (item?.children && item.children.length > 0) {
      return item.children.some((child) => pathname === child.href);
    }

    // children이 없는 메뉴는 정확히 일치해야 함
    return pathname === href;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const active = isActive(item.href, item);

    return (
      <div key={item.name}>
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
            level > 0 ? "ml-6 px-2 py-2" : "",
            active
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name);
            }
          }}
        >
          {hasChildren ? (
            <>
              <item.icon
                className={cn(
                  "h-4 w-4",
                  active ? "text-blue-600" : "text-gray-500"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </>
          ) : (
            <Link href={item.href} className="flex items-center gap-3 w-full">
              <item.icon
                className={cn(
                  "h-4 w-4",
                  active ? "text-blue-600" : "text-gray-500"
                )}
              />
              <span>{item.name}</span>
            </Link>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 pt-20 overflow-y-auto lg:block hidden">
      {/* 브랜드 정보 헤더 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">B</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">보고핏</h2>
            <p className="text-xs text-gray-500">브랜드 파트너</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <nav className="space-y-1">
          {businessMenuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>

      {/* 하단 정보 */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">브랜드 센터</span>
            <span className="text-gray-400">v1.0</span>
          </div>
          <p className="text-gray-400">입점 브랜드 관리 시스템</p>
        </div>
      </div>
    </div>
  );
}
