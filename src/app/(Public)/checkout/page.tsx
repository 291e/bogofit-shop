"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useCreateOrderFromCart } from "@/hooks/useOrders";
import { CreateOrderAddressDto } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Truck, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/providers/languageProvider";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: cart, isLoading: isLoadingCart } = useCart();
  const createOrder = useCreateOrderFromCart();

  const [shippingAddress, setShippingAddress] = useState<CreateOrderAddressDto>({
    recipientName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    countryCode: "KR",
    memo: "",
  });

  // Calculate totals
  const itemsSubtotal = cart?.items.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
  const grandTotal = itemsSubtotal; // No shipping fee

  const validateForm = () => {
    if (!shippingAddress.recipientName) {
      alert(t("checkout.validation.recipientNameRequired"));
      return false;
    }
    if (!shippingAddress.phone) {
      alert(t("checkout.validation.phoneRequired"));
      return false;
    }
    if (!shippingAddress.line1) {
      alert(t("checkout.validation.addressRequired"));
      return false;
    }
    if (!shippingAddress.city) {
      alert(t("checkout.validation.cityRequired"));
      return false;
    }
    if (!shippingAddress.postalCode) {
      alert(t("checkout.validation.postalCodeRequired"));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {


    if (!cart || cart.items.length === 0) {
      console.error("❌ [CHECKOUT] Cart is empty");
      alert(t("checkout.validation.cartEmpty"));
      return;
    }


    if (!validateForm()) {
      console.error("❌ [CHECKOUT] Form validation failed");
      return;
    }



    try {

      const result = await createOrder.mutateAsync({
        shippingAddress,
        discountTotal: 0,
        shippingTotal: 0,
        taxTotal: 0,
      });




      // Redirect to payment page
      if (result.groupId) {

        router.push(`/payment/${result.groupId}`);
      } else {

        router.push("/myPage?section=order");
      }
    } catch (error) {
      console.error("❌ [CHECKOUT] Checkout failed:", error);
      console.error("❌ [CHECKOUT] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        error
      });
    }
  };

  if (isLoadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("checkout.checkingCart")}</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t("checkout.emptyCart")}</h2>
          <p className="text-gray-600 mb-6">{t("checkout.emptyCartDescription")}</p>
          <Button onClick={() => router.push("/")}>{t("checkout.continueShopping")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("checkout.back")}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{t("checkout.title")}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Shipping Address Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-pink-600" />
                  {t("checkout.shippingInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipientName">{t("checkout.recipientName")} *</Label>
                      <Input
                        id="recipientName"
                        required
                        value={shippingAddress.recipientName}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            recipientName: e.target.value,
                          })
                        }
                        placeholder={t("checkout.recipientNamePlaceholder")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">{t("checkout.phone")} *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            phone: e.target.value,
                          })
                        }
                        placeholder={t("checkout.phonePlaceholder")}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="line1">{t("checkout.address")} *</Label>
                    <Input
                      id="line1"
                      required
                      value={shippingAddress.line1}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          line1: e.target.value,
                        })
                      }
                      placeholder={t("checkout.addressPlaceholder")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="line2">{t("checkout.addressDetail")}</Label>
                    <Input
                      id="line2"
                      value={shippingAddress.line2}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          line2: e.target.value,
                        })
                      }
                      placeholder={t("checkout.addressDetailPlaceholder")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t("checkout.city")} *</Label>
                      <Input
                        id="city"
                        required
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                        placeholder={t("checkout.cityPlaceholder")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="postalCode">{t("checkout.postalCode")} *</Label>
                      <Input
                        id="postalCode"
                        required
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            postalCode: e.target.value,
                          })
                        }
                        placeholder={t("checkout.postalCodePlaceholder")}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="memo">{t("checkout.deliveryMemo")}</Label>
                    <Textarea
                      id="memo"
                      value={shippingAddress.memo}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          memo: e.target.value,
                        })
                      }
                      placeholder={t("checkout.deliveryMemoPlaceholder")}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t("checkout.orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {item.productThumbUrl && (
                        <div className="relative w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                          <Image
                            src={item.productThumbUrl}
                            alt={item.productName}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {item.productName}
                        </h4>
                        {item.variantOptionsJson && (
                          <p className="text-xs text-gray-500 truncate">
                            {JSON.stringify(item.variantOptionsJson)}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-600">
                            {t("checkout.quantity").replace("{count}", item.quantity.toString())}
                          </span>
                          <span className="text-sm font-semibold">
                            ₩{item.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("checkout.productAmount")}</span>
                    <span>₩{itemsSubtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t("checkout.totalPayment")}</span>
                    <span className="text-2xl font-bold text-pink-600">
                      ₩{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createOrder.isPending}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-6 text-lg"
                >
                  {createOrder.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      {t("checkout.processing")}
                    </>
                  ) : (
                    <>
                      {t("checkout.payAmount").replace("{amount}", grandTotal.toLocaleString())}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  {t("checkout.termsAgreement")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

