import { useState } from "react";
import { Product, ProductFilters } from "@/types/product";

// Mock data for demo
const mockProducts: Product[] = [
  {
    id: 1,
    brandId: 1,
    brand: { id: 1, name: "Uniqlo", slug: "uniqlo" },
    title: "Áo thun nam basic",
    slug: "ao-thun-nam-basic",
    description: "Áo thun cotton 100% mềm mại, thoáng mát.",
    price: 199000,
    url: "https://bogofit.vn/products/ao-thun-nam-basic",
    category: "Thời trang",
    imageUrl: "https://via.placeholder.com/150x150",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSoldOut: false,
  },
  {
    id: 2,
    brandId: 2,
    brand: { id: 2, name: "Levi's", slug: "levis" },
    title: "Quần jeans nữ skinny",
    slug: "quan-jeans-nu-skinny",
    description: "Quần jeans co giãn, tôn dáng.",
    price: 399000,
    url: "https://bogofit.vn/products/quan-jeans-nu-skinny",
    category: "Thời trang",
    imageUrl: "https://via.placeholder.com/150x150",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isSoldOut: false,
  },
  {
    id: 3,
    brandId: 3,
    brand: { id: 3, name: "Nike", slug: "nike" },
    title: "Giày sneaker thể thao",
    slug: "giay-sneaker-the-thao",
    description: "Giày sneaker năng động, phù hợp mọi hoạt động.",
    price: 599000,
    url: "https://bogofit.vn/products/giay-sneaker-the-thao",
    category: "Giày dép",
    imageUrl: "https://via.placeholder.com/150x150",
    isActive: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    isSoldOut: true,
  },
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(mockProducts.length);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // Simulate fetch
  const fetchProducts = (filters: ProductFilters) => {
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setTotal(mockProducts.length);
      setLoading(false);
      setError(null);
    }, 500);
  };

  // Simulate delete
  const deleteProduct = (id: string) => {
    return new Promise<void>((resolve) => {
      setProducts((prev) => prev.filter((p) => p.id !== Number(id)));
      setTotal((prev) => prev - 1);
      setTimeout(resolve, 300);
    });
  };

  return {
    products,
    loading,
    error,
    pagination,
    total,
    fetchProducts,
    deleteProduct,
  };
}
