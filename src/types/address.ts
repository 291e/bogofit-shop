// types/address.ts

/**
 * Loại địa chỉ
 */
export type AddressType = 'shipping' | 'return' | 'warehouse' | 'billing';

/**
 * Interface cho Address từ API response
 */
export interface Address {
  id: string;                    // UUID
  brandId: string | null;        // UUID của Brand (nullable)
  addressType: AddressType;      // Loại địa chỉ
  label: string | null;          // Nhãn: "집", "회사", "본사"
  recipient: string;             // Tên người nhận
  phone: string | null;          // Số điện thoại
  countryCode: string;           // Mã quốc gia (mặc định: "KR")
  zipCode: string | null;        // Mã bưu điện
  roadAddress: string;           // Địa chỉ đường (도로명)
  jibunAddress: string | null;   // Địa chỉ 지번
  detail: string | null;         // Chi tiết địa chỉ
  isDefault: boolean;            // Địa chỉ mặc định
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
}

/**
 * DTO cho tạo địa chỉ mới
 */
export interface CreateAddressDto {
  brandId?: string | null;       // Optional - UUID của Brand
  addressType: AddressType;      // Required
  label?: string;                // Optional - max 50 chars
  recipient: string;             // Required - max 255 chars
  phone?: string;                // Optional - max 20 chars
  countryCode?: string;          // Optional - default "KR", max 2 chars
  zipCode?: string;              // Optional - max 10 chars
  roadAddress: string;           // Required - max 500 chars
  jibunAddress?: string;         // Optional - max 500 chars
  detail?: string;               // Optional - max 500 chars
  isDefault?: boolean;           // Optional - default false
}

/**
 * DTO cho cập nhật địa chỉ
 */
export interface UpdateAddressDto {
  brandId?: string | null;
  addressType: AddressType;
  label?: string;
  recipient: string;
  phone?: string;
  countryCode?: string;
  zipCode?: string;
  roadAddress: string;
  jibunAddress?: string;
  detail?: string;
  isDefault?: boolean;
}

/**
 * API Response cho single address
 */
export interface AddressResponse {
  success: boolean;
  message: string;
  address?: Address;
}

/**
 * API Response cho multiple addresses
 */
export interface AddressesResponse {
  success: boolean;
  message: string;
  addresses?: Address[];
}

/**
 * API Error Response
 */
export interface AddressErrorResponse {
  success: false;
  message: string;
}

/**
 * Query parameters cho GET addresses
 */
export interface GetAddressesParams {
  addressType?: AddressType;
  brandId?: string;
}
