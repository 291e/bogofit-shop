'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import type { 
  User, 
  LoginDto, 
  LoginByEmailDto, 
  RegisterDto,
  UpdatePasswordDto,
  UpdatePhoneDto,
  UpdateEmailDto,
  UpdateNameDto,
  AuthResponse 
} from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  actionLoading: {
    login: boolean;
    register: boolean;
    updatePhone: boolean;
    updateEmail: boolean;
    updateName: boolean;
    updatePassword: boolean;
  };
  
  // Auth methods
  login: (data: LoginDto) => Promise<void>;
  loginByEmail: (data: LoginByEmailDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  
  // Update methods
  updatePassword: (data: UpdatePasswordDto) => Promise<void>;
  updatePhone: (data: UpdatePhoneDto) => Promise<void>;
  updateEmail: (data: UpdateEmailDto) => Promise<void>;
  updateName: (data: UpdateNameDto) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // ✅ 초기 state를 localStorage에서 동기적으로 읽어서 설정
  const getInitialState = () => {
    if (typeof window === 'undefined') {
      return { user: null, token: null };
    }
    
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      return {
        token: savedToken,
        user: JSON.parse(savedUser) as User,
      };
    }
    
    return { user: null, token: null };
  };

  const initialState = getInitialState();
  const [user, setUser] = useState<User | null>(initialState.user);
  const [token, setToken] = useState<string | null>(initialState.token);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({
    login: false,
    register: false,
    updatePhone: false,
    updateEmail: false,
    updateName: false,
    updatePassword: false,
  });

  // Cookie 설정 및 로딩 완료
  useEffect(() => {
    if (token) {
      // ✅ Ensure cookie is set for middleware - use compatible settings
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
    
    setIsLoading(false);
  }, [token]);

  // Helper to save auth data
  const saveAuthData = (authData: AuthResponse) => {
    // Save to localStorage
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
      setRefreshToken(authData.refreshToken);
    }
    
    // Set cookie for middleware
    document.cookie = `auth_token=${authData.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    
    setToken(authData.token);
    setUser(authData.user);
  };

  // Logout helper
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Clear cookie for middleware
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    
    setToken(null);
    setUser(null);
    setRefreshToken(null);
    toast.info('로그아웃 되었습니다.');
  };

  // Refresh access token
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        setToken(data.token);
        return data.token;
      }
      
      return null;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Helper to make authenticated requests
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      // Auto logout on 401
      if (response.status === 401) {
        logout();
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      // Network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }
      throw error;
    }
  };

  // ========== AUTH METHODS ==========

  const login = async (loginData: LoginDto) => {
    setActionLoading(prev => ({ ...prev, login: true }));
    try {
      const data = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });
      saveAuthData(data);
      toast.success('로그인 성공!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '로그인에 실패했습니다.');
      throw error;
    } finally {
      setActionLoading(prev => ({ ...prev, login: false }));
    }
  };

  const loginByEmail = async (loginData: LoginByEmailDto) => {
    setActionLoading(prev => ({ ...prev, login: true }));
    try {
      const data = await fetchWithAuth('/api/auth/login-email', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });
      saveAuthData(data);
      toast.success('로그인 성공!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '로그인에 실패했습니다.');
      throw error;
    } finally {
      setActionLoading(prev => ({ ...prev, login: false }));
    }
  };

  const register = async (registerData: RegisterDto) => {
    setActionLoading(prev => ({ ...prev, register: true }));
    try {
      const data = await fetchWithAuth('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });
      saveAuthData(data);
      toast.success('회원가입 성공!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
      throw error;
    } finally {
      setActionLoading(prev => ({ ...prev, register: false }));
    }
  };

  const getToken = () => {
    return token;
  };

  // ========== UPDATE METHODS ==========

  const updatePassword = async (updateData: UpdatePasswordDto) => {
    setActionLoading(prev => ({ ...prev, updatePassword: true }));
    try {
      const data = await fetchWithAuth('/api/auth/update-password', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      toast.success(data.message || '비밀번호가 성공적으로 변경되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.');
      throw error;
    } finally {
      setActionLoading(prev => ({ ...prev, updatePassword: false }));
    }
  };

  const updatePhone = async (updateData: UpdatePhoneDto) => {
    setActionLoading(prev => ({ ...prev, updatePhone: true }));
    try {
      const data = await fetchWithAuth('/api/auth/update-phone', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      
      toast.success(data.message || '전화번호가 성공적으로 변경되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '전화번호 변경에 실패했습니다.');
      throw error;
    } finally {
      setActionLoading(prev => ({ ...prev, updatePhone: false }));
    }
  };

  const updateEmail = async (updateData: UpdateEmailDto) => {
    setActionLoading(prev => ({ ...prev, updateEmail: true }));
    try {
      const data = await fetchWithAuth('/api/auth/update-email', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      
      toast.success(data.message || '이메일이 성공적으로 변경되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이메일 변경에 실패했습니다.');
      throw error;
    } finally {
      setActionLoading(prev => ({ ...prev, updateEmail: false }));
    }
  };

  const updateName = async (updateData: UpdateNameDto) => {
    setActionLoading(prev => ({ ...prev, updateName: true }));
    try {
      const data = await fetchWithAuth('/api/auth/update-name', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      
      toast.success(data.message || '이름이 성공적으로 변경되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이름 변경에 실패했습니다.');
      throw error;
    } finally {
      setActionLoading(prev => ({ ...prev, updateName: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!token,
        isLoading,
        actionLoading,
        login,
        loginByEmail,
        register,
        logout,
        getToken,
        refreshAccessToken,
        updatePassword,
        updatePhone,
        updateEmail,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
