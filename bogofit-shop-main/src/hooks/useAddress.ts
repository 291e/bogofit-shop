import { useState, useEffect } from "react";

export interface Address {
  id: string;
  label: string;
  recipient: string;
  zipCode: string;
  address1: string;
  address2: string | null;
  phone: string;
  isDefault: boolean;
  userId: string;
}

export function useAddress(userId: string | undefined) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 주소 목록 불러오기
  const fetchAddresses = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/address?userId=${userId}`);
      if (!res.ok) throw new Error("주소 목록을 불러오는데 실패했습니다.");
      const data = await res.json();
      setAddresses(data.addresses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "주소 목록 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line
  }, [userId]);

  // 주소 추가
  const addAddress = async (address: Omit<Address, "id">) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      if (!res.ok) throw new Error("주소 추가 실패");
      await fetchAddresses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "주소 추가 오류");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 주소 수정
  const updateAddress = async (address: Address) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/address/${address.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      if (!res.ok) throw new Error("주소 수정 실패");
      await fetchAddresses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "주소 수정 오류");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 주소 삭제
  const deleteAddress = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/address/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("주소 삭제 실패");
      await fetchAddresses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "주소 삭제 오류");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 기본 배송지 설정
  const setDefaultAddress = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/address/${id}/default`, { method: "PUT" });
      if (!res.ok) throw new Error("기본 배송지 설정 실패");
      await fetchAddresses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "기본 배송지 오류");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}
