"use client";

import { useState, useEffect, useCallback } from 'react';
import { authUtils } from '@/lib/auth';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = authUtils.getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string) => {
    authUtils.setToken(token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authUtils.removeToken();
    setIsAuthenticated(false);
  }, []);

  const getToken = useCallback(() => {
    return authUtils.getToken();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
  };
};
