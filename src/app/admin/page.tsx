"use client";

import { Users, Store, Package, ShoppingCart, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

// Mock data - will be replaced with real API calls
const stats = [
    {
        name: "총 사용자",
        value: "1,234",
        change: "+12.5%",
        trend: "up",
        icon: Users,
        color: "blue",
    },
    {
        name: "총 브랜드",
        value: "56",
        change: "+8.2%",
        trend: "up",
        icon: Store,
        color: "purple",
    },
    {
        name: "총 상품",
        value: "2,891",
        change: "+23.1%",
        trend: "up",
        icon: Package,
        color: "green",
    },
    {
        name: "총 주문",
        value: "4,567",
        change: "-3.2%",
        trend: "down",
        icon: ShoppingCart,
        color: "orange",
    },
];

const recentActivities = [
    { type: "brand", message: "새로운 브랜드 신청: Nike Store", time: "5분 전" },
    { type: "product", message: "상품 승인 대기: 에어맥스 270", time: "15분 전" },
    { type: "order", message: "새로운 주문: #ORD-12345", time: "30분 전" },
    { type: "user", message: "새로운 사용자 가입: user@example.com", time: "1시간 전" },
];

const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
        blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "bg-blue-500" },
        purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "bg-purple-500" },
        green: { bg: "bg-green-50", text: "text-green-600", icon: "bg-green-500" },
        orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "bg-orange-500" },
    };
    return colors[color] || colors.blue;
};

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">관리자 대시보드에 오신 것을 환영합니다</h1>
                <p className="text-blue-100">BOGOFIT 쇼핑몰의 모든 활동을 한눈에 확인하세요</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const colors = getColorClasses(stat.color);

                    return (
                        <div
                            key={stat.name}
                            className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${colors.icon}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                    }`}>
                                    {stat.trend === "up" ? (
                                        <ArrowUp className="w-4 h-4" />
                                    ) : (
                                        <ArrowDown className="w-4 h-4" />
                                    )}
                                    {stat.change}
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.name}</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">최근 활동</h2>
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                            전체 보기
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">빠른 작업</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                            <Store className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                브랜드 승인
                            </p>
                        </button>
                        <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group">
                            <Package className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                상품 승인
                            </p>
                        </button>
                        <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group">
                            <ShoppingCart className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-green-500 dark:group-hover:text-green-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                                주문 보기
                            </p>
                        </button>
                        <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all group">
                            <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-orange-500 dark:group-hover:text-orange-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                                분석 보기
                            </p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Charts Section - Placeholder */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">매출 추이</h2>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">차트 영역 (Chart.js 또는 Recharts 추가 예정)</p>
                </div>
            </div>
        </div>
    );
}
