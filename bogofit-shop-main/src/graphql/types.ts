export interface User {
  id: string;
  userId: string;
  email: string;
  phoneNumber: string;
  password: string;
  profile: string;
  closet: Closet[];
  style: Style[];
  isAdmin: boolean;
  isBusiness: boolean;
  createdAt: string;
  updatedAt: string;
  providers: Provider[];
  point: number;
  isSuspended: boolean;
  deviceLimit: number;
  [key: string]: unknown;
}

export interface Provider {
  id: string;
  provider: string;
  socialId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Closet {
  id: string;
  user: User;
  userId: string;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Style {
  id: string;
  userId: string;
  result?: string;
  hair?: string;
  face?: string;
  pose?: string;
  top?: string;
  bottom?: string;
  background?: string;
  isOpened: boolean;
  createdAt: string;
  updatedAt: string;
  like: number;
  view: number;
  user?: User;
  [key: string]: unknown;
}

export interface Preset {
  id: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  isOpened: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface Recommend {
  id: string;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  like: number;
  view: number;
}

export interface AdminStats {
  totalUsers: number;
  totalStyles: number;
  totalClosets: number;
  totalPresets: number;
  totalRecommends: number;
  newUsersToday: number;
  newStylesToday: number;
}

export interface AdminDashboard {
  stats: AdminStats;
  recentUsers: User[];
  popularStyles: Style[];
}

export interface AdminCreateUserInput {
  userId: string;
  email: string;
  password: string;
  profile?: string;
  isAdmin?: boolean;
}

export interface AdminUpdateUserInput {
  userId?: string;
  email?: string;
  password?: string;
  profile?: string;
  isAdmin?: boolean;
}

// src/graphql/types.ts
export interface LoginResult {
  success: boolean;
  token: string;
  message: string;
}

export interface LoginWithGoogleResult {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    userId: string;
    email: string;
    profile?: string;
    provider?: string;
  };
}

export interface LoginWithKakaoResult {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    userId: string;
    email: string;
    profile?: string;
    provider?: string;
  };
}

export interface Business {
  id: string;
  user: User;
  userId: string;
  businessName: string;
  description: string;
  location: string;
  presets: BusinessPreset[];
  stores: Store[];
  createdAt: string;
  updatedAt: string;
  deviceLimit?: number;
}

export interface Store {
  id: string;
  business: Business;
  businessId: string;
  storeName: string;
  location: string;
  description: string;
  presets: BusinessPreset[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessPreset {
  id: string;
  business: Business;
  businessId: string;
  store: Store;
  storeId: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  isOpened: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserDevice {
  id: string;
  user: User;
  userid: string;
  deviceid: string;
  createdat: string;
  lastused: string;
  devicename: string;
}
