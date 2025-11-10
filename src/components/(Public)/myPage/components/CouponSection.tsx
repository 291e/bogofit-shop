"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Plus } from "lucide-react";
import { useLanguage } from "@/providers/languageProvider";

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
  const { t } = useLanguage();
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t("myPage.coupon.noCoupons")}</h3>
            <p className="text-gray-500">{t("myPage.coupon.noCouponsDescription")}</p>
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
          <CardTitle>{t("myPage.coupon.register")}</CardTitle>
          <CardDescription>{t("myPage.coupon.registerDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={t("myPage.coupon.couponCodePlaceholder")}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleRegisterCoupon()}
            />
            <Button onClick={handleRegisterCoupon}>
              <Plus className="w-4 h-4 mr-2" />
              {t("myPage.coupon.registerButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-bold mb-4">{t("myPage.coupon.availableCoupons").replace("{count}", availableCoupons.length.toString())}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {availableCoupons.map((coupon) => (
            <Card key={coupon.id} className="border-pink-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{coupon.name}</h4>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800">{t("myPage.coupon.available")}</Badge>
                </div>
                <div className="text-3xl font-bold text-pink-600 mb-2">
                  {coupon.discountType === "percentage" 
                    ? `${coupon.discountValue}%` 
                    : t("myPage.coupon.won").replace("{amount}", coupon.discountValue.toLocaleString())}
                </div>
                {coupon.minPurchase && (
                  <p className="text-sm text-gray-500 mb-2">
                    {t("myPage.coupon.minPurchase").replace("{amount}", coupon.minPurchase.toLocaleString())}
                  </p>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  {t("myPage.coupon.validUntil").replace("{date}", coupon.expiryDate)}
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                    {coupon.code}
                  </code>
                  <Button size="sm" variant="outline">{t("myPage.coupon.copy")}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {usedCoupons.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">{t("myPage.coupon.usedCoupons").replace("{count}", usedCoupons.length.toString())}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {usedCoupons.map((coupon) => (
              <Card key={coupon.id} className="opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{coupon.name}</h4>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                    </div>
                    <Badge variant="secondary">{t("myPage.coupon.used")}</Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-400 mb-2">
                    {coupon.discountType === "percentage" 
                      ? `${coupon.discountValue}%` 
                      : t("myPage.coupon.won").replace("{amount}", coupon.discountValue.toLocaleString())}
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

