import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface GenerateImageRequest {
  baseImage: string; // Base64 encoded image
  prompt?: string;
  productName?: string;
  generateVariations?: boolean;
}

interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  images?: string[];
  error?: string;
  errors?: string[];
}

export function useAIImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useMutation({
    mutationFn: async (request: GenerateImageRequest): Promise<GenerateImageResponse> => {
      setIsGenerating(true);
      
      try {
        const response = await fetch('/api/ai/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to generate image');
        }

        return data;
      } finally {
        setIsGenerating(false);
      }
    },
    onError: (error) => {
      console.error('AI Generation Error:', error);
    }
  });

  return {
    generateImage: generateImage.mutateAsync,
    isGenerating: isGenerating || generateImage.isPending,
    error: generateImage.error,
    data: generateImage.data
  };
}
