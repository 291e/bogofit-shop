import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";

export function useProduct(id: number | string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("상품 ID가 없습니다.");
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.product as Product;
    },
    enabled: !!id,
  });
}
