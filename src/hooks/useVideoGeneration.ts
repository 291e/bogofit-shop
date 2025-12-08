"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// ==================== TYPES ====================

export interface VideoGenerationRequest {
    prompt: string;
    imageUrl?: string;
    negativePrompt?: string;
    config?: {
        durationSeconds?: number;
        aspectRatio?: string;
        resolution?: string;
    };
}

export interface VideoGenerationResponse {
    success: boolean;
    data: {
        videoUrl: string;
        originalUrl: string;
        prompt: string;
        operationName: string;
        duration?: string;
        aspectRatio?: string;
        resolution?: string;
    };
}

// ==================== FETCHER FUNCTIONS ====================

/**
 * Generate video using Gemini Veo 3.1
 */
async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    console.log('🎬 useVideoGeneration: Starting video generation');
    console.log('📤 Request:', request);

    const response = await fetch("/api/ai/generate-video", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`Failed to generate video: ${response.status}`);
    }

    const data: VideoGenerationResponse = await response.json();

    if (!data.success) {
        throw new Error(data.data?.toString() || "Failed to generate video");
    }

    return data;
}

// ==================== HOOKS ====================

/**
 * Hook to generate video from virtual fitting result
 * 
 * @example
 * ```tsx
 * const generateVideo = useVideoGeneration();
 * 
 * const handleGenerateVideo = async () => {
 *   await generateVideo.mutateAsync({
 *     imageUrl: "https://example.com/virtual-fitting-result.jpg",
 *     prompt: "A person wearing the outfit naturally",
 *     productTitle: "Summer Dress"
 *   });
 * };
 * ```
 */
export function useVideoGeneration() {
    return useMutation({
        mutationFn: generateVideo,
        onSuccess: (data) => {
            toast.success("비디오가 성공적으로 생성되었습니다!");
            console.log("✅ Video generated:", data.data.videoUrl);
        },
        onError: (error: Error) => {
            console.error("❌ Video generation failed:", error.message);
            toast.error(error.message || "비디오 생성 실패");
        },
    });
}
