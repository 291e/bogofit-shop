"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  Calendar,
  BarChart3,
  Download,
  Filter
} from "lucide-react";

// Mock Data
const mockStats = {
  totalRevenue: 12500000,
  totalOrders: 156,
  totalCustomers: 89,
  totalProducts: 45,
  revenueChange: 12.5,
  ordersChange: -3.2,
  customersChange: 8.7,
  productsChange: 15.3
};

const mockMonthlyData = [
  { month: "1월", revenue: 850000, orders: 12, customers: 8 },
  { month: "2월", revenue: 920000, orders: 15, customers: 10 },
  { month: "3월", revenue: 1100000, orders: 18, customers: 12 },
  { month: "4월", revenue: 980000, orders: 14, customers: 9 },
  { month: "5월", revenue: 1250000, orders: 20, customers: 15 },
  { month: "6월", revenue: 1400000, orders: 22, customers: 18 },
  { month: "7월", revenue: 1350000, orders: 21, customers: 16 },
  { month: "8월", revenue: 1200000, orders: 19, customers: 14 },
  { month: "9월", revenue: 1450000, orders: 23, customers: 17 },
  { month: "10월", revenue: 1600000, orders: 25, customers: 20 },
  { month: "11월", revenue: 1750000, orders: 28, customers: 22 },
  { month: "12월", revenue: 1900000, orders: 30, customers: 25 }
];

const mockTopProducts = [
  { name: "남성 기본 티셔츠", sales: 45, revenue: 8955000 },
  { name: "여성 청바지", sales: 32, revenue: 12768000 },
  { name: "스니커즈", sales: 28, revenue: 16772000 },
  { name: "가죽 가방", sales: 15, revenue: 13485000 },
  { name: "야구 모자", sales: 38, revenue: 5700000 }
];

const mockTopCustomers = [
  { name: "김민수", email: "kim@email.com", orders: 8, totalSpent: 1250000 },
  { name: "이영희", email: "lee@email.com", orders: 6, totalSpent: 980000 },
  { name: "박철수", email: "park@email.com", orders: 5, totalSpent: 750000 },
  { name: "최지영", email: "choi@email.com", orders: 4, totalSpent: 620000 },
  { name: "정민호", email: "jung@email.com", orders: 3, totalSpent: 480000 }
];

const mockRecentOrders = [
  { id: "ORD-2024-001", customer: "김민수", amount: 250000, status: "완료", date: "2024-01-15" },
  { id: "ORD-2024-002", customer: "이영희", amount: 180000, status: "배송중", date: "2024-01-14" },
  { id: "ORD-2024-003", customer: "박철수", amount: 320000, status: "완료", date: "2024-01-13" },
  { id: "ORD-2024-004", customer: "최지영", amount: 150000, status: "승인대기", date: "2024-01-12" },
  { id: "ORD-2024-005", customer: "정민호", amount: 420000, status: "완료", date: "2024-01-11" }
];

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  change: number; 
  icon: any; 
  color: string; 
}) => {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">지난 달 대비</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data, title }: { data: any[]; title: string }) => {
  const maxValue = Math.max(...data.map(d => d.revenue || d.orders || d.customers));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const value = item.revenue || item.orders || item.customers;
            const percentage = (value / maxValue) * 100;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-sm text-gray-600">{item.month}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-900">
                  {typeof value === 'number' && value >= 1000 
                    ? `${(value / 1000).toFixed(0)}K` 
                    : value}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("12months");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">보고서</h1>
          <p className="text-sm text-gray-600">비즈니스 성과와 통계를 확인하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="7days">최근 7일</option>
            <option value="30days">최근 30일</option>
            <option value="3months">최근 3개월</option>
            <option value="6months">최근 6개월</option>
            <option value="12months">최근 12개월</option>
          </select>
          <Button variant="outline" className="bg-white text-black border border-gray-300 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 매출"
          value={`${(mockStats.totalRevenue / 1000000).toFixed(1)}M원`}
          change={mockStats.revenueChange}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="총 주문"
          value={mockStats.totalOrders}
          change={mockStats.ordersChange}
          icon={ShoppingBag}
          color="bg-blue-500"
        />
        <StatCard
          title="총 고객"
          value={mockStats.totalCustomers}
          change={mockStats.customersChange}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="총 상품"
          value={mockStats.totalProducts}
          change={mockStats.productsChange}
          icon={Package}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart 
          data={mockMonthlyData} 
          title="월별 매출 추이" 
        />
        <SimpleBarChart 
          data={mockMonthlyData} 
          title="월별 주문 수" 
        />
      </div>

      {/* Top Products and Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              인기 상품 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">판매량: {product.sales}개</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {product.revenue.toLocaleString('ko-KR')}원
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              VIP 고객 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {customer.totalSpent.toLocaleString('ko-KR')}원
                    </p>
                    <p className="text-sm text-gray-600">주문: {customer.orders}회</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            최근 주문
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockRecentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.customer}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.amount.toLocaleString('ko-KR')}원
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === '완료' ? 'bg-green-100 text-green-800' :
                        order.status === '배송중' ? 'bg-blue-100 text-blue-800' :
                        order.status === '승인대기' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">성장률</h3>
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
              <p className="text-sm text-gray-600 mt-1">지난 달 대비</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">신규 고객</h3>
              <p className="text-2xl font-bold text-blue-600">23명</p>
              <p className="text-sm text-gray-600 mt-1">이번 달</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">평균 주문액</h3>
              <p className="text-2xl font-bold text-purple-600">80,128원</p>
              <p className="text-sm text-gray-600 mt-1">이번 달</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
