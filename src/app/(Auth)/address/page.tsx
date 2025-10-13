"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Address {
  id: number;
  label: string;
  recipient: string;
  zipCode: string;
  address1: string;
  address2: string | null;
  phone: string;
  isDefault: boolean;
}

export default function AddressPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);

  // 주소 목록 불러오기
  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/address?userId=${user.id}`);
      if (!res.ok) throw new Error("주소 목록을 불러오는데 실패했습니다.");

      const data = await res.json();
      setAddresses(data.addresses);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "주소 목록을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 로그인 상태 확인 및 주소 목록 로드
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user) {
      fetchAddresses();
    }
  }, [user, isAuthenticated, router, fetchAddresses]);

  // 주소 저장
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !currentAddress) return;

    try {
      setLoading(true);
      const method = currentAddress.id ? "PUT" : "POST";
      const url = currentAddress.id
        ? `/api/address/${currentAddress.id}`
        : "/api/address";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentAddress,
          userId: user.id,
        }),
      });

      if (!res.ok) throw new Error("주소 저장에 실패했습니다.");

      setSuccess("주소가 성공적으로 저장되었습니다.");
      setIsEditing(false);
      setCurrentAddress(null);
      fetchAddresses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "주소 저장 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 주소 삭제
  const handleDeleteAddress = async (id: number) => {
    if (!confirm("정말로 이 주소를 삭제하시겠습니까?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/address/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("주소 삭제에 실패했습니다.");

      setSuccess("주소가 성공적으로 삭제되었습니다.");
      fetchAddresses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "주소 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 기본 주소 설정
  const handleSetDefault = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/address/${id}/default`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error("기본 주소 설정에 실패했습니다.");

      setSuccess("기본 주소가 설정되었습니다.");
      fetchAddresses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "기본 주소 설정 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">배송지 관리</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {isEditing ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {currentAddress?.id ? "배송지 수정" : "새 배송지 추가"}
          </h2>
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                배송지명
              </label>
              <Input
                value={currentAddress?.label || ""}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress!,
                    label: e.target.value,
                  })
                }
                placeholder="예: 집, 회사"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                받는 사람
              </label>
              <Input
                value={currentAddress?.recipient || ""}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress!,
                    recipient: e.target.value,
                  })
                }
                placeholder="받는 사람 이름"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                우편번호
              </label>
              <Input
                value={currentAddress?.zipCode || ""}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress!,
                    zipCode: e.target.value,
                  })
                }
                placeholder="우편번호"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주소
              </label>
              <Input
                value={currentAddress?.address1 || ""}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress!,
                    address1: e.target.value,
                  })
                }
                placeholder="기본 주소"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상세 주소
              </label>
              <Input
                value={currentAddress?.address2 || ""}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress!,
                    address2: e.target.value,
                  })
                }
                placeholder="상세 주소"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처
              </label>
              <Input
                value={currentAddress?.phone || ""}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress!,
                    phone: e.target.value,
                  })
                }
                placeholder="연락처 (예: 010-1234-5678)"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={currentAddress?.isDefault || false}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress!,
                    isDefault: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                기본 배송지로 설정
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                저장
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentAddress(null);
                }}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button
          onClick={() => {
            setIsEditing(true);
            setCurrentAddress({
              id: 0,
              label: "",
              recipient: "",
              zipCode: "",
              address1: "",
              address2: null,
              phone: "",
              isDefault: false,
            });
          }}
          className="mb-6"
        >
          <PlusCircle className="w-5 h-5 mr-2" />새 배송지 추가
        </Button>
      )}

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 배송지가 없습니다.
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-lg shadow p-4 relative"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className="font-semibold">{address.label}</span>
                  {address.isDefault && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                      기본
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!address.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetDefault(address.id)}
                      title="기본 배송지로 설정"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(true);
                      setCurrentAddress(address);
                    }}
                    title="수정"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAddress(address.id)}
                    title="삭제"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div>받는 사람: {address.recipient}</div>
                <div>
                  주소: ({address.zipCode}) {address.address1}{" "}
                  {address.address2 || ""}
                </div>
                <div>연락처: {address.phone}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
