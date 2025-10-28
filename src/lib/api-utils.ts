/**
 * API Utility Functions
 * Common functions for handling API responses and errors
 */

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    status?: number;
}

/**
 * Safely parse JSON response from fetch
 * Handles non-JSON responses gracefully
 */
export async function safeJsonParse(response: Response): Promise<ApiResponse> {
    const contentType = response.headers.get("content-type");

    // Accept both application/json and application/problem+json
    if (!contentType || (!contentType.includes("application/json") && !contentType.includes("application/problem+json"))) {
        console.error("Non-JSON response received", {
            status: response.status,
            contentType,
            url: response.url
        });

        return {
            success: false,
            message: `Backend returned non-JSON response (${response.status})`,
            status: response.status
        };
    }

    try {
        const data = await response.json();
        return {
            success: response.ok,
            data,
            status: response.status
        };
    } catch (error) {
        console.error("JSON parsing error:", error);
        return {
            success: false,
            message: "Failed to parse JSON response",
            status: response.status
        };
    }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
    message: string,
    status: number = 500,
    details?: unknown
): ApiResponse {
    return {
        success: false,
        message,
        status,
        data: details
    };
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
    data: T,
    message?: string,
    status: number = 200
): ApiResponse<T> {
    return {
        success: true,
        message,
        data,
        status
    };
}
