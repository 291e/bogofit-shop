"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useAddress } from "@/hooks/useAddress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  MapPin,
  Globe,
  Plus,
} from "lucide-react";
import { CheckoutButton } from "@/components/payment/Checkout";

export default function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const {
    addresses,
    loading: addressLoading,
    addAddress,
  } = useAddress(user?.id);

  // URL 파라미터에서 상품 정보 가져오기
  const productId = searchParams.get("productId");
  const productTitle = searchParams.get("productTitle");
  const productPrice = searchParams.get("productPrice");
  const quantity = searchParams.get("quantity");
  const selectedOption = searchParams.get("selectedOption");

  // 상품 정보가 없을 때 기본값 설정 (개발/테스트용)
  const defaultProductId = productId || "1";
  const defaultProductTitle = productTitle || "BOGOFIT 기본 상품";
  const defaultProductPrice = productPrice || "29900";
  const defaultQuantity = quantity || "1";
  const defaultSelectedOption = selectedOption || "";

  // 실제 사용할 상품 정보
  const finalProductId = defaultProductId;
  const finalProductTitle = defaultProductTitle;
  const finalProductPrice = defaultProductPrice;
  const finalQuantity = defaultQuantity;
  const finalSelectedOption = defaultSelectedOption;

  // 폼 상태
  const [orderForm, setOrderForm] = useState({
    // 주문자 정보
    ordererName: "",
    ordererPhone: "",
    ordererEmail: "",

    // 배송지 정보
    selectedAddressId: "",
    recipientName: "",
    recipientPhone: "",
    address: "",
    addressDetail: "",
    zipCode: "",
    deliveryRequest: "",

    // 통관 정보 (필수)
    customsInfo: {
      recipientNameEn: "",
      personalCustomsCode: "",
    },

    // 약관 동의
    agreements: {
      terms: false,
      privacy: false,
      thirdParty: false,
    },
  });

  // 새 주소 등록 폼
  const [newAddress, setNewAddress] = useState({
    label: "",
    recipient: "",
    phone: "",
    zipCode: "",
    address1: "",
    address2: "",
  });

  // 배송지 탭 상태
  const [addressTab, setAddressTab] = useState("saved");

  // 연락처 자동 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  // 사용자 정보로 초기값 설정
  useEffect(() => {
    if (user) {
      setOrderForm((prev) => ({
        ...prev,
        ordererName: user.userId || "",
        ordererPhone: formatPhoneNumber(user.phoneNumber || ""),
        ordererEmail: user.email || "",
      }));
    }
  }, [user]);

  // URL 파라미터에서 주문 정보 읽어와서 폼에 설정
  useEffect(() => {
    const urlOrdererName = searchParams.get("ordererName");
    const urlOrdererPhone = searchParams.get("ordererPhone");
    const urlOrdererEmail = searchParams.get("ordererEmail");
    const urlRecipientName = searchParams.get("recipientName");
    const urlRecipientPhone = searchParams.get("recipientPhone");
    const urlAddress = searchParams.get("address");
    const urlAddressDetail = searchParams.get("addressDetail");
    const urlZipCode = searchParams.get("zipCode");
    const urlDeliveryRequest = searchParams.get("deliveryRequest");
    const urlRecipientNameEn = searchParams.get("recipientNameEn");
    const urlPersonalCustomsCode = searchParams.get("personalCustomsCode");

    if (urlOrdererName || urlRecipientName) {
      setOrderForm((prev) => ({
        ...prev,
        ordererName: urlOrdererName || prev.ordererName,
        ordererPhone: urlOrdererPhone || prev.ordererPhone,
        ordererEmail: urlOrdererEmail || prev.ordererEmail,
        recipientName: urlRecipientName || prev.recipientName,
        recipientPhone: urlRecipientPhone || prev.recipientPhone,
        address: urlAddress || prev.address,
        addressDetail: urlAddressDetail || prev.addressDetail,
        zipCode: urlZipCode || prev.zipCode,
        deliveryRequest: urlDeliveryRequest || prev.deliveryRequest,
        customsInfo: {
          recipientNameEn:
            urlRecipientNameEn || prev.customsInfo.recipientNameEn,
          personalCustomsCode:
            urlPersonalCustomsCode || prev.customsInfo.personalCustomsCode,
        },
      }));
    }
  }, [searchParams]);

  // 선택된 주소로 배송지 정보 설정
  useEffect(() => {
    if (orderForm.selectedAddressId && addresses) {
      const selectedAddress = addresses.find(
        (addr) => addr.id === orderForm.selectedAddressId
      );
      if (selectedAddress) {
        setOrderForm((prev) => ({
          ...prev,
          recipientName: selectedAddress.recipient,
          recipientPhone: formatPhoneNumber(selectedAddress.phone),
          address: selectedAddress.address1,
          addressDetail: selectedAddress.address2 || "",
          zipCode: selectedAddress.zipCode,
        }));
      }
    }
  }, [orderForm.selectedAddressId, addresses]);

  if (
    !finalProductId ||
    !finalProductTitle ||
    !finalProductPrice ||
    !finalQuantity
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            상품 정보가 필요합니다
          </h2>
          <p className="text-gray-600 mb-6">
            상품 상세 페이지에서 &quot;바로 구매&quot; 버튼을 통해 주문해주세요.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/products")}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              상품 목록으로
            </Button>
            <div className="text-sm text-gray-500">
              <p>또는 브라우저 뒤로가기를 눌러주세요</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = Number(finalProductPrice) * Number(finalQuantity);
  const shippingFee = totalPrice >= 30000 ? 0 : 3000;
  const finalAmount = totalPrice + shippingFee;

  const handleInputChange = (field: string, value: string | boolean) => {
    // 연락처 필드인 경우 자동 포맷팅 적용
    if (field === "ordererPhone" || field === "recipientPhone") {
      value = formatPhoneNumber(value as string);
    }

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      if (parent === "customsInfo") {
        setOrderForm((prev) => ({
          ...prev,
          customsInfo: {
            ...prev.customsInfo,
            [child]: value,
          },
        }));
      } else if (parent === "agreements") {
        setOrderForm((prev) => ({
          ...prev,
          agreements: {
            ...prev.agreements,
            [child]: value,
          },
        }));
      }
    } else {
      setOrderForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleNewAddressChange = (field: string, value: string) => {
    // 연락처 필드인 경우 자동 포맷팅 적용
    if (field === "phone") {
      value = formatPhoneNumber(value);
    }

    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 새 주소 저장
  const handleSaveNewAddress = async () => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (
      !newAddress.label ||
      !newAddress.recipient ||
      !newAddress.phone ||
      !newAddress.address1
    ) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    const success = await addAddress({
      ...newAddress,
      userId: user.id,
      isDefault: addresses.length === 0, // 첫 번째 주소면 기본 주소로 설정
    });

    if (success) {
      alert("주소가 저장되었습니다.");
      // 저장된 주소를 현재 배송지로 설정
      setOrderForm((prev) => ({
        ...prev,
        recipientName: newAddress.recipient,
        recipientPhone: newAddress.phone,
        address: newAddress.address1,
        addressDetail: newAddress.address2,
        zipCode: newAddress.zipCode,
      }));
      // 폼 초기화
      setNewAddress({
        label: "",
        recipient: "",
        phone: "",
        zipCode: "",
        address1: "",
        address2: "",
      });
      // 저장된 주소 탭으로 이동
      setAddressTab("saved");
    }
  };

  // 폼 유효성 체크만 하는 함수 (alert 없음)
  const isFormValid = () => {
    return (
      orderForm.ordererName.trim() !== "" &&
      orderForm.ordererPhone.trim() !== "" &&
      orderForm.recipientName.trim() !== "" &&
      orderForm.recipientPhone.trim() !== "" &&
      orderForm.address.trim() !== "" &&
      orderForm.customsInfo.recipientNameEn.trim() !== "" &&
      orderForm.customsInfo.personalCustomsCode.trim() !== "" &&
      orderForm.agreements.terms &&
      orderForm.agreements.privacy
    );
  };

  // 실제 유효성 검사 및 alert를 띄우는 함수 (CheckoutButton에서만 사용)
  const validateFormWithAlert = () => {
    if (!orderForm.ordererName.trim()) {
      alert("주문자 이름을 입력해주세요.");
      return false;
    }
    if (!orderForm.ordererPhone.trim()) {
      alert("주문자 연락처를 입력해주세요.");
      return false;
    }
    if (!orderForm.recipientName.trim()) {
      alert("받는 분 이름을 입력해주세요.");
      return false;
    }
    if (!orderForm.recipientPhone.trim()) {
      alert("받는 분 연락처를 입력해주세요.");
      return false;
    }
    if (!orderForm.address.trim()) {
      alert("배송 주소를 입력해주세요.");
      return false;
    }
    if (!orderForm.customsInfo.recipientNameEn.trim()) {
      alert("받는 분 영문명을 입력해주세요.");
      return false;
    }
    if (!orderForm.customsInfo.personalCustomsCode.trim()) {
      alert("개인통관고유부호를 입력해주세요.");
      return false;
    }
    if (!orderForm.agreements.terms || !orderForm.agreements.privacy) {
      alert("필수 약관에 동의해주세요.");
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">주문/결제</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 주문 정보 입력 폼 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 상품 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-pink-600" />
                    주문 상품
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {finalProductTitle}
                      </h3>
                      {finalSelectedOption && (
                        <p className="text-sm text-gray-600 mt-1">
                          {finalSelectedOption}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        수량: {finalQuantity}개
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {Number(finalProductPrice).toLocaleString()}원
                      </p>
                      {Number(finalQuantity) > 1 && (
                        <p className="text-sm text-gray-500">
                          총 {totalPrice.toLocaleString()}원
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 주문자 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-pink-600" />
                    주문자 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ordererName">이름 *</Label>
                      <Input
                        id="ordererName"
                        value={orderForm.ordererName}
                        onChange={(e) =>
                          handleInputChange("ordererName", e.target.value)
                        }
                        placeholder="주문자 이름"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ordererPhone">연락처 *</Label>
                      <Input
                        id="ordererPhone"
                        value={orderForm.ordererPhone}
                        onChange={(e) =>
                          handleInputChange("ordererPhone", e.target.value)
                        }
                        placeholder="010-0000-0000"
                        maxLength={13}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ordererEmail">이메일</Label>
                    <Input
                      id="ordererEmail"
                      type="email"
                      value={orderForm.ordererEmail}
                      onChange={(e) =>
                        handleInputChange("ordererEmail", e.target.value)
                      }
                      placeholder="example@email.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 배송지 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-pink-600" />
                    배송지 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={addressTab} onValueChange={setAddressTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="saved">저장된 주소</TabsTrigger>
                      <TabsTrigger value="new">
                        <Plus className="w-4 h-4 mr-1" />새 주소 등록
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="saved" className="space-y-4">
                      {/* 저장된 주소 선택 */}
                      {!addressLoading && addresses && addresses.length > 0 ? (
                        <div>
                          <RadioGroup
                            value={orderForm.selectedAddressId}
                            onValueChange={(value) =>
                              handleInputChange("selectedAddressId", value)
                            }
                            className="space-y-3"
                          >
                            {addresses.map((address) => (
                              <div
                                key={address.id}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={address.id}
                                  id={address.id}
                                />
                                <Label
                                  htmlFor={address.id}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="p-3 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">
                                        {address.recipient}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {address.label}
                                      </Badge>
                                      {address.isDefault && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          기본
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {address.address1} {address.address2}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {address.phone}
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>저장된 주소가 없습니다.</p>
                          <p className="text-sm">새 주소를 등록해주세요.</p>
                        </div>
                      )}

                      {/* 직접 입력 */}
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="font-semibold">또는 직접 입력</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="recipientName">받는 분 *</Label>
                            <Input
                              id="recipientName"
                              value={orderForm.recipientName}
                              onChange={(e) =>
                                handleInputChange(
                                  "recipientName",
                                  e.target.value
                                )
                              }
                              placeholder="받는 분 이름"
                            />
                          </div>
                          <div>
                            <Label htmlFor="recipientPhone">연락처 *</Label>
                            <Input
                              id="recipientPhone"
                              value={orderForm.recipientPhone}
                              onChange={(e) =>
                                handleInputChange(
                                  "recipientPhone",
                                  e.target.value
                                )
                              }
                              placeholder="010-0000-0000"
                              maxLength={13}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="zipCode">우편번호</Label>
                            <Input
                              id="zipCode"
                              value={orderForm.zipCode}
                              onChange={(e) =>
                                handleInputChange("zipCode", e.target.value)
                              }
                              placeholder="12345"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="address">주소 *</Label>
                            <Input
                              id="address"
                              value={orderForm.address}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              placeholder="기본 주소"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="addressDetail">상세 주소</Label>
                          <Input
                            id="addressDetail"
                            value={orderForm.addressDetail}
                            onChange={(e) =>
                              handleInputChange("addressDetail", e.target.value)
                            }
                            placeholder="상세 주소 (선택사항)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryRequest">배송 요청사항</Label>
                          <Textarea
                            id="deliveryRequest"
                            value={orderForm.deliveryRequest}
                            onChange={(e) =>
                              handleInputChange(
                                "deliveryRequest",
                                e.target.value
                              )
                            }
                            placeholder="배송 시 요청사항을 입력해주세요 (선택사항)"
                            rows={3}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="new" className="space-y-4">
                      {/* 새 주소 등록 폼 */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="newLabel">주소 별칭 *</Label>
                          <Input
                            id="newLabel"
                            value={newAddress.label}
                            onChange={(e) =>
                              handleNewAddressChange("label", e.target.value)
                            }
                            placeholder="예: 집, 회사, 친구집"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="newRecipient">받는 분 *</Label>
                            <Input
                              id="newRecipient"
                              value={newAddress.recipient}
                              onChange={(e) =>
                                handleNewAddressChange(
                                  "recipient",
                                  e.target.value
                                )
                              }
                              placeholder="받는 분 이름"
                            />
                          </div>
                          <div>
                            <Label htmlFor="newPhone">연락처 *</Label>
                            <Input
                              id="newPhone"
                              value={newAddress.phone}
                              onChange={(e) =>
                                handleNewAddressChange("phone", e.target.value)
                              }
                              placeholder="010-0000-0000"
                              maxLength={13}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="newZipCode">우편번호</Label>
                            <Input
                              id="newZipCode"
                              value={newAddress.zipCode}
                              onChange={(e) =>
                                handleNewAddressChange(
                                  "zipCode",
                                  e.target.value
                                )
                              }
                              placeholder="12345"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="newAddress1">주소 *</Label>
                            <Input
                              id="newAddress1"
                              value={newAddress.address1}
                              onChange={(e) =>
                                handleNewAddressChange(
                                  "address1",
                                  e.target.value
                                )
                              }
                              placeholder="기본 주소"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="newAddress2">상세 주소</Label>
                          <Input
                            id="newAddress2"
                            value={newAddress.address2}
                            onChange={(e) =>
                              handleNewAddressChange("address2", e.target.value)
                            }
                            placeholder="상세 주소 (선택사항)"
                          />
                        </div>
                        <Button
                          onClick={handleSaveNewAddress}
                          className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          주소 저장하고 사용하기
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* 통관 정보 (필수) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-pink-600" />
                    통관 정보 *
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>해외배송 상품입니다.</strong> 통관을 위해 아래
                      정보를 필수로 입력해주세요.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="recipientNameEn">받는 분 영문명 *</Label>
                      <Input
                        id="recipientNameEn"
                        value={orderForm.customsInfo.recipientNameEn}
                        onChange={(e) =>
                          handleInputChange(
                            "customsInfo.recipientNameEn",
                            e.target.value
                          )
                        }
                        placeholder="Recipient Name (English)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        여권이나 신분증에 기재된 영문명과 동일하게 입력해주세요
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="personalCustomsCode">
                        개인통관고유부호 *
                      </Label>
                      <Input
                        id="personalCustomsCode"
                        value={orderForm.customsInfo.personalCustomsCode}
                        onChange={(e) =>
                          handleInputChange(
                            "customsInfo.personalCustomsCode",
                            e.target.value
                          )
                        }
                        placeholder="P000000000000"
                        maxLength={13}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        관세청 개인통관고유부호 (P로 시작하는 13자리)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 약관 동의 */}
              <Card>
                <CardHeader>
                  <CardTitle>약관 동의</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={orderForm.agreements.terms}
                      onCheckedChange={(checked) =>
                        handleInputChange("agreements.terms", checked)
                      }
                    />
                    <Label htmlFor="terms" className="text-sm">
                      이용약관 동의 (필수)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={orderForm.agreements.privacy}
                      onCheckedChange={(checked) =>
                        handleInputChange("agreements.privacy", checked)
                      }
                    />
                    <Label htmlFor="privacy" className="text-sm">
                      개인정보 수집 및 이용 동의 (필수)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="thirdParty"
                      checked={orderForm.agreements.thirdParty}
                      onCheckedChange={(checked) =>
                        handleInputChange("agreements.thirdParty", checked)
                      }
                    />
                    <Label htmlFor="thirdParty" className="text-sm">
                      개인정보 제3자 제공 동의 (선택)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-pink-600" />
                    주문 요약
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>상품 금액</span>
                      <span>{totalPrice.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>배송비</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="text-green-600">무료</span>
                        ) : (
                          `${shippingFee.toLocaleString()}원`
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>총 결제 금액</span>
                      <span className="text-pink-600">
                        {finalAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 3만원 이상 주문 시 무료배송</p>
                    <p>• 주문 완료 후 1-2일 내 배송 시작</p>
                    <p>• 결제 완료 후 취소/변경이 어려울 수 있습니다</p>
                  </div>

                  {/* Checkout 컴포넌트 사용 */}
                  <div className="space-y-2">
                    {!isFormValid() && (
                      <p className="text-sm text-red-500 text-center">
                        필수 정보를 모두 입력해주세요
                      </p>
                    )}
                    {isFormValid() ? (
                      <div
                        onClick={() => {
                          // 현재 URL 파라미터 가져오기
                          const currentParams = new URLSearchParams(
                            window.location.search
                          );

                          // 주문 정보를 추가 (기존 파라미터 유지)
                          currentParams.set(
                            "ordererName",
                            orderForm.ordererName
                          );
                          currentParams.set(
                            "ordererPhone",
                            orderForm.ordererPhone
                          );
                          currentParams.set(
                            "ordererEmail",
                            orderForm.ordererEmail
                          );
                          currentParams.set(
                            "recipientName",
                            orderForm.recipientName
                          );
                          currentParams.set(
                            "recipientPhone",
                            orderForm.recipientPhone
                          );
                          currentParams.set("address", orderForm.address);
                          currentParams.set(
                            "addressDetail",
                            orderForm.addressDetail
                          );
                          currentParams.set("zipCode", orderForm.zipCode);
                          currentParams.set(
                            "deliveryRequest",
                            orderForm.deliveryRequest
                          );
                          currentParams.set(
                            "recipientNameEn",
                            orderForm.customsInfo.recipientNameEn
                          );
                          currentParams.set(
                            "personalCustomsCode",
                            orderForm.customsInfo.personalCustomsCode
                          );

                          // URL에 파라미터 업데이트 (기존 상품 정보 파라미터 유지)
                          const newUrl = `${
                            window.location.pathname
                          }?${currentParams.toString()}`;
                          window.history.replaceState({}, "", newUrl);
                        }}
                      >
                        <CheckoutButton
                          productId={Number(finalProductId)}
                          productTitle={finalProductTitle}
                          productPrice={finalAmount}
                          selectedOption={finalSelectedOption}
                          hasOptions={!!finalSelectedOption}
                        />
                      </div>
                    ) : (
                      <Button
                        onClick={() => validateFormWithAlert()}
                        className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg"
                      >
                        {finalAmount.toLocaleString()}원 결제하기
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
