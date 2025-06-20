"use client";
import { useState } from "react";
import { usePaymentHistory, Payment } from "@/hooks/usePaymentHistory";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Package,
  Truck,
  MapPin,
  User,
  CreditCard,
  Phone,
  Mail,
} from "lucide-react";

export default function OrderHistory() {
  const { data: payments, isLoading, error } = usePaymentHistory();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const paymentMethodMap = {
    CARD: "신용카드",
    VIRTUAL_ACCOUNT: "가상계좌",
    TRANSFER: "계좌이체",
    MOBILE: "휴대폰",
    CULTURE_GIFT_CERTIFICATE: "문화상품권",
    BOOK_GIFT_CERTIFICATE: "도서문화상품권",
    GAME_GIFT_CERTIFICATE: "게임문화상품권",
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error instanceof Error
          ? error.message
          : "결제 내역을 불러오는데 실패했습니다."}
      </div>
    );
  }

  if (!payments?.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        주문 내역이 없습니다.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">주문 내역 조회</h2>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            onClick={() => setSelectedPayment(payment)}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div>
              {payment.product?.imageUrl ? (
                <Image
                  src={payment.product.imageUrl}
                  alt={payment.product?.title || ""}
                  width={80}
                  height={80}
                  className="rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <span className="font-semibold hover:text-[#d74fdf] transition-colors">
                {payment.product?.title || "상품명 없음"}
                {payment.productCount > 1 && (
                  <span className="ml-2 text-xs text-gray-400">
                    외 {payment.productCount - 1}건
                  </span>
                )}
              </span>
              <p className="text-sm text-gray-500">
                주문일: {payment.createdAt.slice(0, 10)}
              </p>
              <p className="text-sm text-gray-500">
                주문번호: {payment.orderId}
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <p className="text-lg font-bold">
                {payment.amount.toLocaleString()}원
              </p>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                {payment.status === "COMPLETED"
                  ? "완료"
                  : payment.status === "PENDING"
                  ? "진행중"
                  : payment.status === "FAIL"
                  ? "실패"
                  : payment.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 주문 내역 모달 */}
      <Dialog
        open={!!selectedPayment}
        onOpenChange={() => setSelectedPayment(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-600" />
              주문 상세 내역
            </DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* 상품 정보 */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  주문 상품
                </h3>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  {selectedPayment.product?.imageUrl ? (
                    <Image
                      src={selectedPayment.product.imageUrl}
                      alt={selectedPayment.product?.title || ""}
                      width={80}
                      height={80}
                      className="rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {selectedPayment.product?.title || "상품명 없음"}
                    </h4>
                    {selectedPayment.productCount > 1 && (
                      <p className="text-sm text-gray-500">
                        외 {selectedPayment.productCount - 1}건
                      </p>
                    )}
                    <p className="text-lg font-bold text-pink-600 mt-2">
                      {selectedPayment.amount.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 결제 정보 */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  결제 정보
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">주문번호</span>
                    <p className="font-medium">{selectedPayment.orderId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">결제금액</span>
                    <p className="font-medium">
                      {selectedPayment.amount.toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">결제수단</span>
                    <p className="font-medium">
                      {paymentMethodMap[
                        selectedPayment.method as keyof typeof paymentMethodMap
                      ] || selectedPayment.method}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">주문일시</span>
                    <p className="font-medium">
                      {format(new Date(selectedPayment.createdAt), "PPP p", {
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 주문자 정보 */}
              {selectedPayment.orderer && (
                <>
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      주문자 정보
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {selectedPayment.orderer.name && (
                        <div>
                          <span className="text-gray-500">성명</span>
                          <p className="font-medium">
                            {selectedPayment.orderer.name}
                          </p>
                        </div>
                      )}
                      {selectedPayment.orderer.email && (
                        <div>
                          <span className="text-gray-500">이메일</span>
                          <p className="font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {selectedPayment.orderer.email}
                          </p>
                        </div>
                      )}
                      {selectedPayment.orderer.phone && (
                        <div>
                          <span className="text-gray-500">휴대폰</span>
                          <p className="font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {selectedPayment.orderer.phone}
                          </p>
                        </div>
                      )}
                      {selectedPayment.orderer.tel && (
                        <div>
                          <span className="text-gray-500">유선전화</span>
                          <p className="font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {selectedPayment.orderer.tel}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 배송지 정보 */}
              {selectedPayment.shipping && (
                <>
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      배송지 정보
                    </h3>
                    <div className="space-y-3 text-sm">
                      {selectedPayment.shipping.recipientName && (
                        <div>
                          <span className="text-gray-500">받는 분</span>
                          <p className="font-medium">
                            {selectedPayment.shipping.recipientName}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedPayment.shipping.recipientPhone && (
                          <div>
                            <span className="text-gray-500">연락처</span>
                            <p className="font-medium flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {selectedPayment.shipping.recipientPhone}
                            </p>
                          </div>
                        )}
                        {selectedPayment.shipping.recipientTel && (
                          <div>
                            <span className="text-gray-500">유선전화</span>
                            <p className="font-medium flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {selectedPayment.shipping.recipientTel}
                            </p>
                          </div>
                        )}
                      </div>

                      {(selectedPayment.shipping.zipCode ||
                        selectedPayment.shipping.address1) && (
                        <div>
                          <span className="text-gray-500">주소</span>
                          <div className="space-y-1">
                            {selectedPayment.shipping.zipCode && (
                              <p className="text-xs text-gray-600">
                                우편번호: {selectedPayment.shipping.zipCode}
                              </p>
                            )}
                            {selectedPayment.shipping.address1 && (
                              <p className="font-medium">
                                {selectedPayment.shipping.address1}
                              </p>
                            )}
                            {selectedPayment.shipping.address2 && (
                              <p className="text-gray-600">
                                {selectedPayment.shipping.address2}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedPayment.customsId && (
                        <div>
                          <span className="text-gray-500">통관고유번호</span>
                          <p className="font-medium font-mono text-sm">
                            {selectedPayment.customsId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 배송 정보 */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  배송 정보
                </h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      배송 준비중
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    주문이 확인되었습니다. 곧 배송 준비가 시작됩니다.
                  </p>
                </div>
              </div>

              {/* 고객 지원 */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  고객 지원
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• 주문 관련 문의: metabank@naver.com</p>
                  <p>• 배송 문의: metabank@naver.com</p>
                  <p>• 고객센터: 042-385-1008 (평일 10:00-18:00)</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
