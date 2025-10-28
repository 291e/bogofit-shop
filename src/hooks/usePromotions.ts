import { useState, useEffect } from 'react';
import { Promotion, CreatePromotionRequest, UpdatePromotionRequest, PromotionFilters } from '@/types/promotion';
import { useAuth } from '@/providers/authProvider';
interface UsePromotionsOptions {
    brandId?: string;
    filters?: PromotionFilters;
    page?: number;
    pageSize?: number;
    autoFetch?: boolean;
}

export function usePromotions(options: UsePromotionsOptions = {}) {
    const { getToken } = useAuth();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchPromotions = async () => {
        if (!options.brandId) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                brandId: options.brandId,
                page: (options.page || 1).toString(),
                pageSize: (options.pageSize || 10).toString(),
            });

            if (options.filters?.status) params.append('status', options.filters.status);
            if (options.filters?.type) params.append('type', options.filters.type);
            // Backend uses 'onlyActive' parameter
            if (options.filters?.onlyActive !== undefined) params.append('onlyActive', options.filters.onlyActive.toString());
            // Fallback for isActive (frontend compatibility)
            if (options.filters?.isActive !== undefined && options.filters?.onlyActive === undefined) {
                params.append('onlyActive', options.filters.isActive.toString());
            }

            const token = getToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/promotion?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch promotions');
            }

            // Backend response may have 'promotions' or 'items'
            const promotionsData = data.promotions || data.items || [];
            const paginationData = data.pagination || data;

            setPromotions(promotionsData);
            setTotalCount(paginationData.totalCount || 0);
            setTotalPages(paginationData.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (options.autoFetch !== false && options.brandId) {
            fetchPromotions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        options.brandId,
        options.page,
        options.pageSize,
        options.filters?.status,
        options.filters?.type,
        options.filters?.onlyActive,
        options.filters?.isActive
    ]);

    return {
        promotions,
        loading,
        error,
        totalCount,
        totalPages,
        refetch: fetchPromotions
    };
}

export function usePromotion(id: string) {
    const { getToken } = useAuth();
    const [promotion, setPromotion] = useState<Promotion | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPromotion = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/promotion/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch promotion');
            }

            setPromotion(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPromotion();
        }
    }, [id]);

    return {
        promotion,
        loading,
        error,
        refetch: fetchPromotion
    };
}

export function useCreatePromotion() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPromotion = async (brandId: string, data: CreatePromotionRequest) => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/promotion?brandId=${brandId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create promotion');
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        createPromotion,
        loading,
        error
    };
}

export function useUpdatePromotion() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updatePromotion = async (id: string, brandId: string, data: UpdatePromotionRequest) => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/promotion/${id}?brandId=${brandId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update promotion');
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        updatePromotion,
        loading,
        error
    };
}

export function useDeletePromotion() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deletePromotion = async (id: string, brandId: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/promotion/${id}?brandId=${brandId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete promotion');
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        deletePromotion,
        loading,
        error
    };
}

// 🚀 Cache for active promotions (5 minutes TTL)
const activePromotionsCache = new Map<string, { data: Promotion[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useActivePromotions(brandId: string) {
    const { getToken } = useAuth();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchActivePromotions = async (forceRefresh = false) => {
        if (!brandId) return;

        // ✅ Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cached = activePromotionsCache.get(brandId);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                setPromotions(cached.data);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not found.');

            // ✅ Use correct endpoint: /api/promotion?brandId=...&onlyActive=true
            const params = new URLSearchParams({
                brandId: brandId,
                page: '1',
                pageSize: '100', // Get all active promotions
                onlyActive: 'true',
            });

            const response = await fetch(`/api/promotion?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch active promotions');
            }

            const promotionsData = data.promotions || data.items || [];
            setPromotions(promotionsData);

            // ✅ Update cache
            activePromotionsCache.set(brandId, { data: promotionsData, timestamp: Date.now() });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (brandId) {
            fetchActivePromotions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brandId]);

    return {
        promotions,
        loading,
        error,
        refetch: () => fetchActivePromotions(true) // Force refresh when called manually
    };
}

/**
 * v2.2: Assign promotion to a product
 */
export function useAssignProductPromotion() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const assignPromotion = async (productId: string, promotionId: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/product/${productId}/promotion`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ promotionId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to assign promotion');
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        assignPromotion,
        loading,
        error,
    };
}

/**
 * v2.2: Remove promotion from a product
 */
export function useRemoveProductPromotion() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const removePromotion = async (productId: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/product/${productId}/promotion`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to remove promotion');
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        removePromotion,
        loading,
        error,
    };
}

/**
 * v2.2: Bulk assign/remove promotion to multiple products
 */
export function useBulkAssignProductPromotion() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const bulkAssignPromotion = async (productIds: string[], promotionId: string | null) => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/product/bulk-assign-promotion`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productIds, promotionId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to bulk assign promotion');
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        bulkAssignPromotion,
        loading,
        error,
    };
}