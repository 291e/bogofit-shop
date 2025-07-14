import { cookies } from "next/headers";

// 카페24 API 기본 설정
const CAFE24_API_BASE_URL = `https://${process.env.CAFE24_SHOP_ID}.cafe24api.com/api/v2`;

// 카페24 API 응답 타입 정의
export interface Cafe24Product {
  product_no: number;
  product_code: string;
  product_name: string;
  product_name_english?: string;
  display_name?: string;
  detail_image?: string;
  list_image?: string;
  tiny_image?: string;
  small_image?: string;
  category?: Array<{
    category_no: number;
    category_name: string;
    category_depth: number;
  }>;
  price?: {
    pc_price: string;
    mobile_price: string;
    price_excluding_tax: string;
    price_including_tax: string;
  };
  description?: string;
  mobile_description?: string;
  additional_images?: Array<{
    big?: string;
    medium?: string;
    small?: string;
  }>;
  custom_product_code?: string;
  options?: Array<{
    option_name: string;
    option_value: string;
  }>;
}

export interface Cafe24Order {
  order_id: string;
  order_date: string;
  order_status: string;
  items: Array<{
    product_no: number;
    product_name: string;
    product_code: string;
    option_value: string;
    quantity: number;
    product_price: string;
  }>;
  buyer_info: {
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
  };
}

export interface Cafe24Member {
  member_id: string;
  member_name: string;
  member_email: string;
  member_phone: string;
  member_birth: string;
  member_group_no: number;
  created_date: string;
}

// 토큰 관련 함수들
export async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("cafe24_access_token")?.value || null;
  } catch (error) {
    console.error("토큰 가져오기 실패:", error);
    return null;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("cafe24_refresh_token")?.value;

    if (!refreshToken) {
      throw new Error("리프레시 토큰이 없습니다");
    }

    const response = await fetch(`${CAFE24_API_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.CAFE24_CLIENT_ID}:${process.env.CAFE24_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("토큰 갱신 실패");
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
    return null;
  }
}

// 카페24 API 호출 헬퍼 함수
export async function cafe24ApiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  retryOnUnauthorized: boolean = true
): Promise<T> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("액세스 토큰이 없습니다");
  }

  const url = `${CAFE24_API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    // 401 에러 시 토큰 갱신 후 재시도
    if (response.status === 401 && retryOnUnauthorized) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, { ...options, headers });

        if (!retryResponse.ok) {
          throw new Error(`API 호출 실패: ${retryResponse.status}`);
        }

        return await retryResponse.json();
      }
    }

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("카페24 API 호출 오류:", error);
    throw error;
  }
}

// 상품 관련 API 함수들
export async function getProduct(productNo: number): Promise<Cafe24Product> {
  const response = await cafe24ApiCall<{ product: Cafe24Product }>(
    `/admin/products/${productNo}`
  );
  return response.product;
}

export async function getProducts(
  limit: number = 10,
  offset: number = 0
): Promise<Cafe24Product[]> {
  const response = await cafe24ApiCall<{ products: Cafe24Product[] }>(
    `/admin/products?limit=${limit}&offset=${offset}`
  );
  return response.products;
}

export async function searchProducts(
  keyword: string,
  limit: number = 10
): Promise<Cafe24Product[]> {
  const response = await cafe24ApiCall<{ products: Cafe24Product[] }>(
    `/admin/products?product_name=${encodeURIComponent(keyword)}&limit=${limit}`
  );
  return response.products;
}

// 주문 관련 API 함수들
export async function getOrders(
  limit: number = 10,
  offset: number = 0
): Promise<Cafe24Order[]> {
  const response = await cafe24ApiCall<{ orders: Cafe24Order[] }>(
    `/admin/orders?limit=${limit}&offset=${offset}`
  );
  return response.orders;
}

export async function getOrder(orderId: string): Promise<Cafe24Order> {
  const response = await cafe24ApiCall<{ order: Cafe24Order }>(
    `/admin/orders/${orderId}`
  );
  return response.order;
}

// 회원 관련 API 함수들
export async function getMembers(
  limit: number = 10,
  offset: number = 0
): Promise<Cafe24Member[]> {
  const response = await cafe24ApiCall<{ customers: Cafe24Member[] }>(
    `/admin/customers?limit=${limit}&offset=${offset}`
  );
  return response.customers;
}

export async function getMember(memberId: string): Promise<Cafe24Member> {
  const response = await cafe24ApiCall<{ customer: Cafe24Member }>(
    `/admin/customers/${memberId}`
  );
  return response.customer;
}

// 카테고리 관련 API 함수들
export async function getCategories(): Promise<
  Array<{
    category_no: number;
    category_name: string;
    category_depth: number;
    parent_category_no?: number;
  }>
> {
  const response = await cafe24ApiCall<{
    categories: Array<{
      category_no: number;
      category_name: string;
      category_depth: number;
      parent_category_no?: number;
    }>;
  }>("/admin/categories");
  return response.categories;
}

// 상품 이미지 관련 함수들
export async function getProductImages(productNo: number): Promise<
  Array<{
    image_no: number;
    image_url: string;
    image_type: string;
    image_path: string;
  }>
> {
  const response = await cafe24ApiCall<{
    images: Array<{
      image_no: number;
      image_url: string;
      image_type: string;
      image_path: string;
    }>;
  }>(`/admin/products/${productNo}/images`);
  return response.images;
}
