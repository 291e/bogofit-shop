"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/authProvider";

// ==================== QUERY KEYS ====================

export const SETTLEMENT_QUERY_KEYS = {
    all: ["settlement"] as const,
    stats: (timeRange: string, startDate?: string, endDate?: string) =>
        [...SETTLEMENT_QUERY_KEYS.all, "stats", timeRange, startDate, endDate] as const,
    pending: () => [...SETTLEMENT_QUERY_KEYS.all, "pending"] as const,
    completed: () => [...SETTLEMENT_QUERY_KEYS.all, "completed"] as const,
};

// ==================== TYPES ====================

export interface SettlementStats {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    newCustomers: number;
    revenueGrowth: number;
    ordersGrowth: number;
    aovGrowth: number;
    customersGrowth: number;
    timeRange: string;
    startDate: string;
    endDate: string;
}

export interface SettlementStatsResponse {
    success: boolean;
    data: SettlementStats;
}

// ==================== FETCHER FUNCTIONS ====================

/**
 * Get settlement statistics
 */
async function fetchSettlementStats(
    timeRange: string,
    token: string,
    startDate?: string,
    endDate?: string
): Promise<SettlementStats> {
    const params = new URLSearchParams({
        timeRange,
    });

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    console.log('🔍 useSettlementStats: Fetching settlement stats');
    console.log('📤 URL:', `/api/settlement/stats?${params.toString()}`);

    const response = await fetch(
        `/api/settlement/stats?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch settlement stats: ${response.status}`);
    }

    const data: SettlementStatsResponse = await response.json();

    if (!data.success) {
        throw new Error(data.data?.toString() || "Failed to fetch settlement stats");
    }

    return data.data;
}

// ==================== HOOKS ====================

/**
 * Hook to fetch settlement statistics
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useSettlementStats('30d');
 * const stats = data;
 * ```
 */
export function useSettlementStats(
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d',
    startDate?: string,
    endDate?: string
) {
    const { token, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: SETTLEMENT_QUERY_KEYS.stats(timeRange, startDate, endDate),
        queryFn: () => {
            if (!token) throw new Error("Authentication required");
            return fetchSettlementStats(timeRange, token, startDate, endDate);
        },
        enabled: isAuthenticated && !!token,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}
