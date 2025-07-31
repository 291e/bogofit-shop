
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Package,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Star,
} from "lucide-react";

export default function DashboardPage() {
  const shopData = {
    name: "My Awesome Shop",
    avatar: "/logo/bogofit logo.png",
    newOrders: 12,
    todayRevenue: 2450000,
    totalProducts: 156,
    rating: 4.8
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  return (
    <main className="flex-1 h-full overflow-y-auto px-6 py-6">
      <header className="sticky top-0 z-20 bg-gray-50 pb-2">
        <div className="px-2 py-2 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          
        </div>
      </header>

      <div className="pt-4 space-y-8 pb-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "새 주문",
              icon: <Package className="h-4 w-4 text-muted-foreground" />,
              value: shopData.newOrders,
              color: "text-blue-600",
              desc: "+2 하루 전"
            },
            {
              title: "오늘 수익",
              icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
              value: formatCurrency(shopData.todayRevenue),
              color: "text-green-600",
              desc: "+12% 하루 전"
            },
            {
              title: "전체 상품수",
              icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
              value: shopData.totalProducts,
              color: "text-purple-600",
              desc: "활동 중"
            },
            {
              title: "평점",
              icon: <Star className="h-4 w-4 text-muted-foreground" />,
              value: shopData.rating,
              color: "text-yellow-600",
              desc: "156개 평점"
            }
          ].map((item, i) => (
            <Card key={i} className="hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders + Weekly Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>최근 주문</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((order) => (
                  <div key={order} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">주문 #{1000 + order}</p>
                        <p className="text-sm text-gray-500">2분 전</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(150000 * order)}</p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        확인됨
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>주간 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  ["주문", "89"],
                  ["수익", formatCurrency(12500000)],
                  ["새 고객", "23"],
                  ["판매 상품", "156"]
                ].map(([label, value], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
