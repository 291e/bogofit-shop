// Cafe24 OAuth 타입 정의

export interface Cafe24OAuthConfig {
  mallId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  baseUrl: string;
}

export interface Cafe24AuthorizationCodeRequest {
  response_type: "code";
  client_id: string;
  state: string;
  redirect_uri: string;
  scope: string;
}

export interface Cafe24TokenRequest {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
}

export interface Cafe24TokenResponse {
  access_token: string;
  expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  client_id: string;
  mall_id: string;
  user_id: string;
  scopes: string[];
  issued_at: string;
}

export interface Cafe24RefreshTokenRequest {
  grant_type: "refresh_token";
  refresh_token: string;
}

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

export interface Cafe24ApiError {
  error: string;
  error_description: string;
}
