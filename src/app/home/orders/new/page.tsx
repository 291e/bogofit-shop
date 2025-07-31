
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Search, User, Package, MapPin, DollarSign } from "lucide-react";

// Fake data for demo
const customers = [
  { id: "C001", name: "Alice Johnson", email: "alice@example.com", phone: "0123456789" },
  { id: "C002", name: "Bob Smith", email: "bob@example.com", phone: "0987654321" },
  { id: "C003", name: "Charlie Brown", email: "charlie@example.com", phone: "0555666777" },
  { id: "C004", name: "Diana Prince", email: "diana@example.com", phone: "0111222333" },
];

const products = [
  { id: "SP001", name: "남성 기본 티셔츠", price: 199000, stock: 20, category: "상의" },
  { id: "SP002", name: "여성 청바지", price: 399000, stock: 0, category: "하의" },
  { id: "SP003", name: "스니커즈", price: 599000, stock: 5, category: "신발" },
  { id: "SP004", name: "가죽 가방", price: 899000, stock: 8, category: "가방" },
  { id: "SP005", name: "야구 모자", price: 150000, stock: 15, category: "액세서리" },
];

export default function CreateOrderPage() {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  const [items, setItems] = useState([{ 
    productSearch: "", 
    selectedProduct: null as typeof products[0] | null, 
    quantity: 1,
    showProductDropdown: false 
  }]);
  
  const [orderDetails, setOrderDetails] = useState({
    address: "",
    note: "",
    paymentMethod: "cash",
    shippingMethod: "standard"
  });
  
  const [total, setTotal] = useState(0);

  // 자동 총액 계산
  const calcTotal = (items: { selectedProduct: typeof products[0] | null; quantity: number }[]) => {
    return items.reduce((sum, item) => {
      return sum + (item.selectedProduct ? item.selectedProduct.price * item.quantity : 0);
    }, 0);
  };

  // 고객 검색 필터링
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  // 상품 검색 필터링
  const getFilteredProducts = (search: string) => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  };

  // 고객 선택 처리
  const handleCustomerSelect = (customer: typeof customers[0]) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  // 상품 선택 처리
  const handleProductSelect = (idx: number, product: typeof products[0]) => {
    const newItems = [...items];
    newItems[idx].selectedProduct = product;
    newItems[idx].productSearch = product.name;
    newItems[idx].showProductDropdown = false;
    setItems(newItems);
    setTotal(calcTotal(newItems));
  };

  // 상품 검색 또는 수량 변경 시
  const handleItemChange = (idx: number, field: "productSearch" | "quantity", value: string | number) => {
    const newItems = [...items];
    if (field === "productSearch") {
      newItems[idx].productSearch = value as string;
      newItems[idx].showProductDropdown = true;
      if (!value) {
        newItems[idx].selectedProduct = null;
        newItems[idx].showProductDropdown = false;
      }
    }
    if (field === "quantity") newItems[idx].quantity = Number(value);
    setItems(newItems);
    setTotal(calcTotal(newItems));
  };

  // 상품 추가
  const addItem = () => setItems([...items, { 
    productSearch: "", 
    selectedProduct: null, 
    quantity: 1,
    showProductDropdown: false 
  }]);
  
  // 상품 삭제
  const removeItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    setTotal(calcTotal(newItems));
  };

  // 주문 정보 업데이트
  const handleOrderDetailsChange = (field: string, value: string) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }));
  };

  // 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("고객을 선택해주세요");
      return;
    }
    if (items.some(item => !item.selectedProduct)) {
      alert("모든 항목에 상품을 선택해주세요");
      return;
    }
    if (!orderDetails.address.trim()) {
      alert("배송 주소를 입력해주세요");
      return;
    }
    
    console.log("새 주문:", {
      customer: selectedCustomer,
      items: items.map(item => ({
        product: item.selectedProduct,
        quantity: item.quantity,
        subtotal: item.selectedProduct!.price * item.quantity
      })),
      orderDetails,
      total
    });
    
    alert("주문이 성공적으로 생성되었습니다!");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">새 주문 생성</h1>
          <p className="text-sm text-gray-600">고객 정보와 상품을 입력하여 주문을 생성하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 고객 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              고객 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  value={customerSearch}
                  onChange={e => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                    if (!e.target.value) {
                      setSelectedCustomer(null);
                      setShowCustomerDropdown(false);
                    }
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="이름, 이메일, ID 또는 전화번호로 고객 검색..."
                  className="w-full pl-10"
                  required
                />
              </div>
              {showCustomerDropdown && customerSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleCustomerSelect(customer)}  
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.email} • {customer.phone}</div>
                        <div className="text-xs text-gray-500">ID: {customer.id}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500">고객을 찾을 수 없습니다</div>
                  )}
                </div>
              )}
            </div>
            
            {selectedCustomer && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-green-900">{selectedCustomer.name}</div>
                    <div className="text-sm text-green-700">{selectedCustomer.email} • {selectedCustomer.phone}</div>
                    <div className="text-xs text-green-600">ID: {selectedCustomer.id}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 주문 상품 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              주문 상품
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex gap-3 items-start">
                  <div className="relative flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        value={item.productSearch}
                        onChange={e => handleItemChange(idx, "productSearch", e.target.value)}
                        onFocus={() => {
                          const newItems = [...items];
                          newItems[idx].showProductDropdown = true;
                          setItems(newItems);
                        }}
                        placeholder="이름, 코드 또는 카테고리로 상품 검색..."
                        className="w-full pl-10"
                        required
                      />
                    </div>
                    {item.showProductDropdown && item.productSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {getFilteredProducts(item.productSearch).length > 0 ? (
                          getFilteredProducts(item.productSearch).map(product => (
                            <div
                              key={product.id}
                              className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleProductSelect(idx, product)}
                            >
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-600">
                                {product.category} • ID: {product.id}
                              </div>
                              <div className="text-sm font-medium text-purple-600">
                                {product.price.toLocaleString()}원 • 재고: {product.stock}
                                {product.stock === 0 && <span className="text-red-500 ml-1">(품절)</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500">상품을 찾을 수 없습니다</div>
                        )}
                      </div>
                    )}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={item.selectedProduct?.stock || 99}
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, "quantity", e.target.value)}
                    className="w-24"
                    placeholder="수량"
                    required
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => removeItem(idx)} 
                    disabled={items.length === 1}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {item.selectedProduct && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-purple-900">{item.selectedProduct.name}</div>
                          <div className="text-sm text-purple-700">
                            {item.selectedProduct.category} • ID: {item.selectedProduct.id}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-purple-900">
                          {item.selectedProduct.price.toLocaleString()}원 × {item.quantity}
                        </div>
                        <div className="text-sm font-bold text-purple-600">
                          {(item.selectedProduct.price * item.quantity).toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addItem} className="bg-gray-100">
              <Plus className="h-4 w-4 mr-2" />
              상품 추가
            </Button>
          </CardContent>
        </Card>

        {/* 배송 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              배송 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">배송 주소</Label>
              <Textarea 
                id="address" 
                value={orderDetails.address} 
                onChange={e => handleOrderDetailsChange("address", e.target.value)} 
                placeholder="상세한 배송 주소를 입력하세요..."
                rows={3}
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="note">메모</Label>
              <Textarea 
                id="note" 
                value={orderDetails.note} 
                onChange={e => handleOrderDetailsChange("note", e.target.value)} 
                placeholder="주문에 대한 메모 (선택사항)..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment">결제 방법</Label>
                <select
                  id="payment"
                  value={orderDetails.paymentMethod}
                  onChange={e => handleOrderDetailsChange("paymentMethod", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="cash">현금</option>
                  <option value="bank">계좌이체</option>
                  <option value="card">신용카드</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="shipping">배송 방법</Label>
                <select
                  id="shipping"
                  value={orderDetails.shippingMethod}
                  onChange={e => handleOrderDetailsChange("shippingMethod", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="standard">일반 배송</option>
                  <option value="express">빠른 배송</option>
                  <option value="pickup">직접 수령</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 총 금액 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              주문 총액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 text-center">
              {total.toLocaleString()}원
            </div>
            <div className="text-center text-gray-600 mt-2">
              총 {items.filter(item => item.selectedProduct).length}개 상품
            </div>
          </CardContent>
        </Card>

        {/* 주문 생성 버튼 */}
        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            주문 생성
          </Button>
        </div>
      </form>
    </div>
  );
}
