import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/authProvider';
import type { Address, AddressesResponse, AddressType } from '@/types/address';

interface UseAddressesOptions {
  addressType?: AddressType;
  brandId?: string;
  onlyDefault?: boolean;
}

export function useAddresses(options: UseAddressesOptions = {}) {
  const { token } = useAuth();
  const { addressType, brandId, onlyDefault } = options;

  return useQuery({
    queryKey: ['addresses', addressType, brandId, onlyDefault],
    queryFn: async (): Promise<Address[]> => {
      const queryParams = new URLSearchParams();
      if (addressType) queryParams.append('addressType', addressType);
      if (brandId) queryParams.append('brandId', brandId);
      if (onlyDefault) queryParams.append('onlyDefault', 'true');
      
      const queryString = queryParams.toString();
      const url = `/api/addresses${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '주소를 가져오는데 실패했습니다');
      }

      const data: AddressesResponse = await response.json();
      return data.addresses || [];
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateAddress(brandId?: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressData: Partial<Address>) => {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...addressData, brandId: brandId || null }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '주소 추가에 실패했습니다');
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅', data.message);
      queryClient.invalidateQueries({ 
        queryKey: ['addresses'],
        exact: false
      });
    },
    onError: (error: Error) => {
      console.error('❌', error.message);
    }
  });
}

export function useUpdateAddress() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...addressData }: Partial<Address> & { id: string }) => {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '주소 수정에 실패했습니다');
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅', data.message);
      queryClient.invalidateQueries({ 
        queryKey: ['addresses'],
        exact: false
      });
    },
    onError: (error: Error) => {
      console.error('❌', error.message);
    }
  });
}

export function useDeleteAddress() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '주소 삭제에 실패했습니다');
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅', data.message);
      queryClient.invalidateQueries({ 
        queryKey: ['addresses'],
        exact: false
      });
    },
    onError: (error: Error) => {
      console.error('❌', error.message);
    }
  });
}

export function useSetDefaultAddress() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/addresses/${id}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '기본 배송지 설정에 실패했습니다');
      }

      return data;
    },
    onSuccess: (data) => {
      // ✅ Show success message from backend
      console.log('✅', data.message);
      
      // ✅ Invalidate all address queries
      queryClient.invalidateQueries({ 
        queryKey: ['addresses'],
        exact: false
      });
    },
    onError: (error: Error) => {
      console.error('❌', error.message);
    }
  });
}

