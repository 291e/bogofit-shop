"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiApplicationResponse, CreateApplicationResponse, ApplicationFormData } from "@/types/application";
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// Query key constants
export const APPLICATION_QUERY_KEY = ["application"];

/**
 * Fetch current user's application
 */
async function fetchApplication(getToken: () => string | null): Promise<ApiApplicationResponse> {
  const token = getToken();
  
  if (!token) {
    throw new Error("Unauthorized");
  }

  const response = await fetch("/api/application", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch application");
  }

  return response.json();
}

/**
 * Create or update application
 */
async function submitApplication(data: ApplicationFormData & { isEditing?: boolean }, isEditing: boolean, applicationId: string, getToken: () => string | null): Promise<CreateApplicationResponse> {
  const token = getToken();
  
  if (!token) {
    throw new Error("Unauthorized");
  }

  const { ...applicationData } = data;

  const response = await fetch("/api/application", {
    method: isEditing ? "PATCH" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(applicationData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit application");
  }

  return response.json();
}

/**
 * Hook to fetch current application
 */
export function useApplication() {
  const { token, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: APPLICATION_QUERY_KEY,
    queryFn: () => fetchApplication(() => token!),
    enabled: isAuthenticated && !!token, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to submit (create/update) application
 */
export function useSubmitApplication() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: ({ data, isEditing, applicationId }: { data: ApplicationFormData & { isEditing?: boolean }, isEditing: boolean, applicationId: string }) => submitApplication(data, isEditing, applicationId, () => token!),
    onSuccess: (data: CreateApplicationResponse) => {
      const isEditing = data.message?.includes("수정") || data.message?.includes("updated");
      // ✅ Optimistic update: Update cache với data từ response
      if (data.application) {
        queryClient.setQueryData(APPLICATION_QUERY_KEY, {
          success: true,
          message: data.message,
          application: data.application
        });
      } else {
        // Fallback: Invalidate nếu không có data
        queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEY });
      }
      
      toast.success(
        isEditing ? "사업자 신청서가 수정되었습니다!" : "사업자 신청이 완료되었습니다!",
        {
          description: "재검토 후 결과를 알려드리겠습니다.",
        }
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "신청 실패");
    },
  });
}
