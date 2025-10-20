"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Plus } from "lucide-react";

interface Coupon {
  id: string;
  name: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase?: number;
  expiryDate: string;
  isUsed: boolean;
  code: string;
}

export default function CouponSection() {
  const [coupons] = useState<Coupon[]>([
    // 임시 데이터
  ]);
  const [couponCode, setCouponCode] = useState("");

  const handleRegisterCoupon = () => {
    if (!couponCode.trim()) return;
    // TODO: API 호출하여 쿠폰 등록
    // TODO: Implement coupon registration
    setCouponCode("");
  };

  if (coupons.length === 0) {
    return (
      <div className="space-y-6">
      

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Ticket className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">사용 가능한 쿠폰이 없습니다</h3>
            <p className="text-gray-500">쿠폰 코드를 입력하여 새로운 쿠폰을 등록해보세요</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableCoupons = coupons.filter(c => !c.isUsed);
  const usedCoupons = coupons.filter(c => c.isUsed);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>쿠폰 등록</CardTitle>
          <CardDescription>쿠폰 코드를 입력하여 새로운 쿠폰을 등록하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="쿠폰 코드 입력"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleRegisterCoupon()}
            />
            <Button onClick={handleRegisterCoupon}>
              <Plus className="w-4 h-4 mr-2" />
              등록
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-bold mb-4">사용 가능한 쿠폰 ({availableCoupons.length})</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {availableCoupons.map((coupon) => (
            <Card key={coupon.id} className="border-pink-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{coupon.name}</h4>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800">사용 가능</Badge>
                </div>
                <div className="text-3xl font-bold text-pink-600 mb-2">
                  {coupon.discountType === "percentage" 
                    ? `${coupon.discountValue}%` 
                    : `${coupon.discountValue.toLocaleString()}원`}
                </div>
                {coupon.minPurchase && (
                  <p className="text-sm text-gray-500 mb-2">
                    최소 {coupon.minPurchase.toLocaleString()}원 이상 구매 시
                  </p>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  유효기간: {coupon.expiryDate}
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                    {coupon.code}
                  </code>
                  <Button size="sm" variant="outline">복사</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {usedCoupons.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">사용한 쿠폰 ({usedCoupons.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {usedCoupons.map((coupon) => (
              <Card key={coupon.id} className="opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{coupon.name}</h4>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                    </div>
                    <Badge variant="secondary">사용 완료</Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-400 mb-2">
                    {coupon.discountType === "percentage" 
                      ? `${coupon.discountValue}%` 
                      : `${coupon.discountValue.toLocaleString()}원`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

