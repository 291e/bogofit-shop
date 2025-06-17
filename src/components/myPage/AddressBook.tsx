"use client";
import { useState } from "react";
import { useAddress, Address } from "@/hooks/useAddress";
import { useAuth } from "@/providers/AuthProvider";
import { Pencil, Trash, Check, Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddressFormState {
  id?: string;
  label: string;
  recipient: string;
  zipCode: string;
  address1: string;
  address2: string;
  phone: string;
  tel: string;
  isDefault: boolean;
}

const initialForm: AddressFormState = {
  label: "",
  recipient: "",
  zipCode: "",
  address1: "",
  address2: "",
  phone: "",
  tel: "",
  isDefault: false,
};

// window.daum 타입 선언
declare global {
  interface Window {
    daum?: unknown;
  }
}

type DaumPostcodeConstructor = new (options: {
  oncomplete: (data: unknown) => void;
}) => { open: () => void };

function loadDaumPostcodeScript() {
  if (document.getElementById("daum-postcode-script")) return;
  const script = document.createElement("script");
  script.id = "daum-postcode-script";
  script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  script.async = true;
  document.body.appendChild(script);
}

export default function AddressBook() {
  const { user } = useAuth();
  const userId = user?.id;
  console.log("AddressBook - user:", user);
  console.log("AddressBook - userId (User.id):", userId);
  const {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddress(userId);

  const [form, setForm] = useState<AddressFormState>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // 주소 수정 클릭
  const handleEdit = (addr: Address) => {
    setForm({
      id: addr.id,
      label: addr.label,
      recipient: addr.recipient,
      zipCode: addr.zipCode,
      address1: addr.address1,
      address2: addr.address2 || "",
      phone: addr.phone,
      tel: "",
      isDefault: addr.isDefault,
    });
    setIsEditing(true);
    setFormError("");
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (
      !form.label ||
      !form.recipient ||
      !form.zipCode ||
      !form.address1 ||
      !form.phone
    ) {
      setFormError("필수 항목을 모두 입력해주세요.");
      return;
    }
    if (!userId || typeof userId !== "string") {
      setFormError("로그인 정보가 올바르지 않습니다. 다시 로그인 해주세요.");
      return;
    }
    const addressData = {
      ...form,
      address2: form.address2 || null,
      userId,
    };
    let ok = false;
    if (form.id) {
      ok = await updateAddress({ ...addressData, id: form.id } as Address);
    } else {
      ok = await addAddress(addressData as Omit<Address, "id">);
    }
    if (ok) {
      setForm(initialForm);
      setIsEditing(false);
    }
  };
  // 주소 삭제
  const handleDelete = async (id: string) => {
    if (window.confirm("정말로 이 주소를 삭제하시겠습니까?")) {
      await deleteAddress(id);
    }
  };

  // 기본 배송지 설정
  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
  };

  // 폼 취소
  const handleCancel = () => {
    setForm(initialForm);
    setIsEditing(false);
    setFormError("");
  };

  // 다음 주소 API 연동
  const handleSearchAddress = () => {
    loadDaumPostcodeScript();
    const open = () => {
      const DaumPostcode = (window.daum as { Postcode?: unknown })?.Postcode as
        | DaumPostcodeConstructor
        | undefined;
      if (!DaumPostcode) return;
      new DaumPostcode({
        oncomplete: function (data: unknown) {
          const d = data as {
            zonecode: string;
            roadAddress: string;
            jibunAddress: string;
          };
          setForm((f) => ({
            ...f,
            zipCode: d.zonecode,
            address1: d.roadAddress || d.jibunAddress,
          }));
        },
      }).open();
    };
    if ((window.daum as { Postcode?: unknown })?.Postcode) {
      open();
    } else {
      // 스크립트 로드 후 실행
      const check = setInterval(() => {
        if ((window.daum as { Postcode?: unknown })?.Postcode) {
          clearInterval(check);
          open();
        }
      }, 100);
    }
  };

  // 폼 열기/닫기
  const handleOpenForm = () => {
    setShowForm(true);
    setForm(initialForm);
    setIsEditing(false);
    setFormError("");
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setForm(initialForm);
    setIsEditing(false);
    setFormError("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">배송 주소록 관리</h2>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">최대 10개까지 등록 가능</div>
        {!isEditing && !showForm && (
          <Button onClick={handleOpenForm} variant="default" size="sm">
            + 배송지 등록
          </Button>
        )}
        {(isEditing || showForm) && (
          <Button onClick={handleCloseForm} variant="outline" size="sm">
            닫기
          </Button>
        )}
      </div>
      {/* 폼 */}
      {(showForm || isEditing) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? "배송지 수정" : "새 배송지 등록"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                배송지명 <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, label: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                성명 <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.recipient}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recipient: e.target.value }))
                }
                required
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  우편번호 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.zipCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, zipCode: e.target.value }))
                  }
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={handleSearchAddress}
              >
                <Search className="w-4 h-4 mr-1" /> 주소검색
              </Button>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                기본주소 <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.address1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address1: e.target.value }))
                }
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                나머지 주소 (선택)
              </label>
              <Input
                value={form.address2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address2: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">일반전화</label>
              <Input
                value={form.tel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tel: e.target.value }))
                }
                placeholder="02-0000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                휴대전화 <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                required
                placeholder="010-0000-0000"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isDefault: e.target.checked }))
                }
                className="mr-2"
              />
              <label htmlFor="isDefault" className="text-sm">
                기본 배송지로 저장
              </label>
            </div>
            {formError && (
              <div className="col-span-2 text-red-500 text-sm">{formError}</div>
            )}
            <div className="col-span-2 flex gap-2 mt-2 justify-end">
              {(isEditing || showForm) && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  취소
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {isEditing ? "수정" : "등록"}
              </Button>
            </div>
          </form>
        </div>
      )}
      {/* 주소 목록 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-dashed border-gray-300 rounded-lg shadow-inner">
          <MapPin className="w-12 h-12 text-gray-400 mb-3" />
          <div className="text-lg font-semibold text-gray-700 mb-1">
            등록된 배송지가 없습니다.
          </div>
          <div className="text-gray-500 mb-4">
            배송지를 등록하고 빠른 쇼핑을 경험하세요.
          </div>
          {!showForm && (
            <Button onClick={handleOpenForm} variant="default">
              + 배송지 등록
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center gap-4 border relative"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                      기본
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <div>받는 사람: {addr.recipient}</div>
                  <div>
                    주소: ({addr.zipCode}) {addr.address1} {addr.address2 || ""}
                  </div>
                  <div>연락처: {addr.phone}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {!addr.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSetDefault(addr.id)}
                    title="기본 배송지로 설정"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(addr)}
                  title="수정"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(addr.id)}
                  title="삭제"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
