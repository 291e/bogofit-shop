"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Store,
    Package,
    ShoppingCart,
    Tag,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navigation = [
    { name: "대시보드", href: "/admin", icon: LayoutDashboard },
    { name: "사용자 관리", href: "/admin/users", icon: Users },
    { name: "브랜드 관리", href: "/admin/brands", icon: Store },
    { name: "상품 관리", href: "/admin/products", icon: Package },
    { name: "주문 관리", href: "/admin/orders", icon: ShoppingCart },
    { name: "프로모션 관리", href: "/admin/promotions", icon: Tag },
    { name: "분석", href: "/admin/analytics", icon: BarChart3 },
    { name: "설정", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={`${collapsed ? "w-20" : "w-64"
                } bg-white text-gray-900 border-r border-gray-200 transition-all duration-300 flex flex-col`}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
                {!collapsed && (
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        ADMIN
                    </h1>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            title={collapsed ? item.name : undefined}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && (
                                <span className="font-medium">{item.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="p-4 border-t border-gray-200">
                    <div className="text-xs text-center text-gray-500">
                        BOGOFIT Admin v1.0
                    </div>
                </div>
            )}
        </div>
    );
}
