"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Eye, Package, Truck, CheckCircle, XCircle, Calendar, User, MapPin } from "lucide-react";

// Order Status Types
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

// Order Interface
interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  shippingMethod: string;
  paymentMethod: string;
  notes?: string;
}

// Mock Data
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: {
      name: "김민치",
      email: "an.nguyen@email.com",
      phone: "0901234567"
    },
    address: {
      street: "123 Đường ABC",
      city: "대전",
      state: "대전",
      zipCode: "100000",
      country: "한국국"
    },
    items: [
      {
        productId: "1",
        productName: "Áo thun nam basic",
        price: 150000,
        quantity: 2,
        image: "https://via.placeholder.com/60x60"
      },
      {
        productId: "2",
        productName: "Quần jean nam",
        price: 350000,
        quantity: 1,
        image: "https://via.placeholder.com/60x60"
      }
    ],
    total: 650000,
    status: "pending",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    shippingMethod: "Giao hàng nhanh",
    paymentMethod: "Thanh toán khi nhận hàng",
    notes: "Giao hàng vào buổi sáng"
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: {
      name: "Trần Thị Bình",
      email: "binh.tran@email.com",
      phone: "0912345678"
    },
    address: {
      street: "456 Đường XYZ",
      city: "TP. Hồ Chí Minh",
      state: "TP. Hồ Chí Minh",
      zipCode: "700000",
      country: "Việt Nam"
    },
    items: [
      {
        productId: "3",
        productName: "Túi xách nữ",
        price: 500000,
        quantity: 1,
        image: "https://via.placeholder.com/60x60"
      }
    ],
    total: 500000,
    status: "confirmed",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-16"),
    shippingMethod: "Giao hàng tiêu chuẩn",
    paymentMethod: "Chuyển khoản ngân hàng"
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: {
      name: "Lê Văn Cường",
      email: "cuong.le@email.com",
      phone: "0923456789"
    },
    address: {
      street: "789 Đường DEF",
      city: "Đà Nẵng",
      state: "Đà Nẵng",
      zipCode: "500000",
      country: "Việt Nam"
    },
    items: [
      {
        productId: "4",
        productName: "Giày thể thao",
        price: 800000,
        quantity: 1,
        image: "https://via.placeholder.com/60x60"
      },
      {
        productId: "5",
        productName: "Vớ thể thao",
        price: 50000,
        quantity: 3,
        image: "https://via.placeholder.com/60x60"
      }
    ],
    total: 950000,
    status: "shipped",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-17"),
    shippingMethod: "Giao hàng nhanh",
    paymentMethod: "Ví điện tử"
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: {
      name: "Phạm Thị Dung",
      email: "dung.pham@email.com",
      phone: "0934567890"
    },
    address: {
      street: "321 Đường GHI",
      city: "Cần Thơ",
      state: "Cần Thơ",
      zipCode: "900000",
      country: "Việt Nam"
    },
    items: [
      {
        productId: "6",
        productName: "Đồng hồ nam",
        price: 1200000,
        quantity: 1,
        image: "https://via.placeholder.com/60x60"
      }
    ],
    total: 1200000,
    status: "delivered",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    shippingMethod: "Giao hàng tiêu chuẩn",
    paymentMethod: "Thẻ tín dụng"
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: {
      name: "Hoàng Văn Em",
      email: "em.hoang@email.com",
      phone: "0945678901"
    },
    address: {
      street: "654 Đường JKL",
      city: "Hải Phòng",
      state: "Hải Phòng",
      zipCode: "300000",
      country: "Việt Nam"
    },
    items: [
      {
        productId: "7",
        productName: "Kính mát",
        price: 200000,
        quantity: 2,
        image: "https://via.placeholder.com/60x60"
      }
    ],
    total: 400000,
    status: "cancelled",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-16"),
    shippingMethod: "Giao hàng nhanh",
    paymentMethod: "Thanh toán khi nhận hàng",
    notes: "Khách hàng yêu cầu hủy"
  }
];

// Status Badge Component
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig = {
    pending: { label: "승인 대기", color: "bg-yellow-100 text-yellow-800" },
    confirmed: { label: "승인됨", color: "bg-blue-100 text-blue-800" },
    shipped: { label: "배송 중", color: "bg-purple-100 text-purple-800" },
    delivered: { label: "배송 완료", color: "bg-green-100 text-green-800" },
    cancelled: { label: "취소됨", color: "bg-red-100 text-red-800" }
  };

  const config = statusConfig[status];
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, isOpen, onClose, onStatusUpdate }: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}) => {
  if (!isOpen || !order) return null;

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    onStatusUpdate(order.id, newStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">주문 상세 {order.orderNumber}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  고객 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>이름:</strong> {order.customer.name}</p>
                <p><strong>이메일:</strong> {order.customer.email}</p>
                <p><strong>전화번호:</strong> {order.customer.phone}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  배송 주소
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state}</p>
                <p>{order.address.zipCode}, {order.address.country}</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>주문 상품</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-gray-600">수량: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.price.toLocaleString('ko-KR')} ₩</p>
                      <p className="text-sm text-gray-600">합계: {(item.price * item.quantity).toLocaleString('ko-KR')} ₩</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>주문 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>주문번호:</strong> {order.orderNumber}</p>
                <p><strong>주문일:</strong> {order.createdAt.toLocaleDateString('ko-KR')}</p>
                <p><strong>배송 방법:</strong> {order.shippingMethod}</p>
                <p><strong>결제 방법:</strong> {order.paymentMethod}</p>
                <p><strong>총 금액:</strong> <span className="font-bold text-lg">{order.total.toLocaleString('ko-KR')} ₩</span></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>상태 업데이트</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                </div>
                <div className="space-y-2">
                  {order.status === 'pending' && (
                    <Button onClick={() => handleStatusUpdate('confirmed')} className="w-full bg-white text-black border border-gray-300 hover:bg-gray-50">
                      주문 승인
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button onClick={() => handleStatusUpdate('shipped')} className="w-full bg-white text-black border border-gray-300 hover:bg-gray-50">
                      배송 시작
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button onClick={() => handleStatusUpdate('delivered')} className="w-full bg-white text-black border border-gray-300 hover:bg-gray-50">
                      배송 완료
                    </Button>
                  )}
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <Button onClick={() => handleStatusUpdate('cancelled')} className="w-full bg-white text-red-600 border border-red-300 hover:bg-red-50">
                      주문 취소
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>메모</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || order.status === statusFilter;

    const matchesDate = dateFilter === "" ||
      order.createdAt.toLocaleDateString('vi-VN') === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Update order status
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date() }
        : order
    ));
  };

  // Open order detail modal
  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
          <p className="text-sm text-gray-600">모든 주문을 확인하고 관리하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            총: {filteredOrders.length}개 주문
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="주문번호, 고객명, 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">필터:</span>
          </div>

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}>
            <option value="">모든 상태</option>
            <option value="pending">승인 대기</option>
            <option value="confirmed">승인됨</option>
            <option value="shipped">배송 중</option>
            <option value="delivered">배송 완료</option>
            <option value="cancelled">취소됨</option>
          </Select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
          />

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setDateFilter("");
            }}
            className="bg-white text-black border border-gray-300 hover:bg-gray-50"
          >
            필터 초기화
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items.length}개 상품
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items[0]?.productName}
                        {order.items.length > 1 && ` +${order.items.length - 1}개 더`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.total.toLocaleString('ko-KR')} ₩
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.createdAt.toLocaleDateString('ko-KR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.createdAt.toLocaleTimeString('ko-KR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openOrderDetail(order)}
                        className="flex items-center gap-1 bg-white text-black border border-gray-300 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        상세
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              주문을 찾을 수 없습니다
            </h3>
            <p className="text-gray-500">
              필터나 검색어를 변경해보세요
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
