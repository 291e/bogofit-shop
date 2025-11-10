"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  humanSamples,
  garmentSamples,
  lowerSamples,
  itemSamples,
} from "@/contents/VirtualFitting/sampleImages";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { useLanguage } from "@/providers/languageProvider";

interface VirtualFittingProps {
  productTitle?: string;
  productCategory?: string;
  currentImage?: string; // 현재 선택된 메인 이미지
  onResultGenerated?: (resultImage: string) => void; // 가상 피팅 결과 콜백
}

export default function VirtualFitting({
  productTitle,
  productCategory,
  currentImage,
  onResultGenerated,
}: VirtualFittingProps) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<{
    human_file: File | null;
    garment_file: File | null;
    lower_file: File | null;
    background_file: File | null;
  }>({
    human_file: null,
    garment_file: null,
    lower_file: null,
    background_file: null,
  });

  const [previews, setPreviews] = useState<{
    human_file: string;
    garment_file: string;
    lower_file: string;
    background_file: string;
  }>({
    human_file: "",
    garment_file: "",
    lower_file: "",
    background_file: "",
  });

  // Track selected sample source URLs for each field
  const [selectedSampleSrcs, setSelectedSampleSrcs] = useState<{
    human_file: string;
    garment_file: string;
    lower_file: string;
    background_file: string;
  }>({
    human_file: "",
    garment_file: "",
    lower_file: "",
    background_file: "",
  });

  const [isProEnabled, setIsProEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [imageLoading, setImageLoading] = useState(false); // Generated image loading state
  // Virtual Fitting API Selection
  const [useGeminiAPI, setUseGeminiAPI] = useState(false); // true: BOGOFIT V2, false: BOGOFIT V1 (default: V1)

  // Single item image for Gemini AI
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [itemPreview, setItemPreview] = useState<string>("");

  // Video generation hook
  const videoGeneration = useVideoGeneration();

  // Download helper function
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback to opening in new tab if download fails
      window.open(url, "_blank");
    }
  };

  // 파일 업로드 오류 상태 추가
  const [fileErrors, setFileErrors] = useState<{
    human_file: string;
    garment_file: string;
    lower_file: string;
    background_file: string;
  }>({
    human_file: "",
    garment_file: "",
    lower_file: "",
    background_file: "",
  });

  const connectionInfoRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clientId = "0d7d0263c7f94a4a90cf2dbbff3a45bf";

  // 진행률 점진적 증가 함수 (더 부드러운 애니메이션)
  const startProgressTimer = (
    startProgress: number,
    targetProgress: number,
    duration: number
  ) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const startTime = Date.now();
    const progressDiff = targetProgress - startProgress;

    // 즉시 시작 진행률 설정
    setProgress(startProgress);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Linear progress (đều đặn, không tăng/giảm tốc)
      const currentProgress = startProgress + progressDiff * progressRatio;

      setProgress(Math.round(currentProgress));

      if (progressRatio >= 1) {
        clearInterval(progressIntervalRef.current!);
        progressIntervalRef.current = null;
      }
    }, 50); // Update every 50ms
  };

  const clearProgressTimer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // 파일 유효성 검사 함수
  const validateFile = (file: File): string => {
    // 파일 형식 검사
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return t("productDetail.virtualFitting.unsupportedFormat");
    }

    return "";
  };

  // 이미지 URL을 File 객체로 변환하는 함수 (프록시 사용)
  const urlToFile = async (
    url: string,
    filename: string
  ): Promise<File | null> => {
    try {
      // ✅ Data URL인 경우 (AI generated images)
      if (url.startsWith("data:")) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type || "image/png" });
      }

      // 로컬 이미지인 경우 직접 사용
      if (url.startsWith("/")) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(t("productDetail.virtualFitting.imageLoadFailed").replace("{status}", response.status.toString()));
        }

        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type || "image/jpeg" });
      }

      // 외부 이미지인 경우 프록시 사용
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(t("productDetail.virtualFitting.proxyRequestFailed").replace("{status}", response.status.toString()));
      }

      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type || "image/jpeg" });
    } catch {
      return null;
    }
  };

  // currentImage가 변경될 때 자동으로 해당 카테고리 필드에 설정
  useEffect(() => {
    const autoUploadCurrentImage = async () => {
      if (currentImage && productCategory) {
        try {
          const file = await urlToFile(
            currentImage,
            `${productTitle || "product"}.jpg`
          );
          if (file) {
            // 상의, 아우터, 원피스는 garment_file로 설정
            if (
              productCategory === "상의" ||
              productCategory === "아우터" ||
              productCategory === "원피스"
            ) {
              setFiles((prev) => ({ ...prev, garment_file: file }));
              setPreviews((prev) => ({ ...prev, garment_file: currentImage }));
            } else if (productCategory === "하의") {
              setFiles((prev) => ({ ...prev, lower_file: file }));
              setPreviews((prev) => ({ ...prev, lower_file: currentImage }));
            }
          }
        } catch {
          // Silently handle error
        }
      }
    };

    autoUploadCurrentImage();
  }, [currentImage, productCategory, productTitle]);

  // 파일 업로드 핸들러 (개선된 버전)
  const handleFileChange = (
    fieldName: keyof typeof files,
    file: File | null
  ) => {
    // 기존 에러 메시지 초기화
    setFileErrors((prev) => ({ ...prev, [fieldName]: "" }));

    if (file) {
      // 파일 유효성 검사
      const error = validateFile(file);
      if (error) {
        setFileErrors((prev) => ({ ...prev, [fieldName]: error }));
        return;
      }

      // 파일 설정
      setFiles((prev) => ({ ...prev, [fieldName]: file }));

      // 미리보기 생성
      const reader = new FileReader();

      reader.onload = (e) => {
        setPreviews((prev) => ({
          ...prev,
          [fieldName]: e.target?.result as string,
        }));
      };

      reader.onerror = () => {
        setFileErrors((prev) => ({
          ...prev,
          [fieldName]: t("productDetail.virtualFitting.fileReadError"),
        }));
      };

      // 이미지 파일인지 추가 검증
      const img = new window.Image();

      // 임시 URL로 이미지 유효성 검사
      const tempUrl = URL.createObjectURL(file);
      img.src = tempUrl;

      img.onload = () => {
        URL.revokeObjectURL(tempUrl);
        reader.readAsDataURL(file);
      };

      img.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        setFileErrors((prev) => ({
          ...prev,
          [fieldName]: t("productDetail.virtualFitting.invalidImageFile"),
        }));
      };
    } else {
      // 파일이 null인 경우 프리뷰도 초기화
      setFiles((prev) => ({ ...prev, [fieldName]: null }));
      setPreviews((prev) => ({ ...prev, [fieldName]: "" }));
      // Clear selected sample source URL
      setSelectedSampleSrcs((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // 샘플 이미지 선택 핸들러
  const handleSampleSelect = (
    fieldName: keyof typeof files,
    imageSrc: string
  ) => {
    // 샘플 이미지는 검증된 이미지이므로 에러 초기화
    setFileErrors((prev) => ({ ...prev, [fieldName]: "" }));
    setPreviews((prev) => ({ ...prev, [fieldName]: imageSrc }));
    // Track the selected sample source URL
    setSelectedSampleSrcs((prev) => ({ ...prev, [fieldName]: imageSrc }));
  };

  // Handle accessory file upload
  const handleItemImageChange = (file: File | null) => {
    if (file) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }

      setItemImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setItemPreview(e.target?.result as string || "");
      };
      reader.readAsDataURL(file);
    } else {
      setItemImage(null);
      setItemPreview("");
    }
  };

  // BOGOFIT V2 (Gemini 기반)를 사용한 가상 피팅
  const runGeminiVirtualFitting = async () => {
    // For Gemini: human_file and garment_file are REQUIRED
    // itemImage is optional
    if (!files.human_file || !files.garment_file) {
      alert(t("productDetail.virtualFitting.uploadModelAndTop"));
      return;
    }

    try {
      setProgress(0);
      setStatus(t("productDetail.virtualFitting.workflowStarting"));

      const formData = new FormData();
      formData.append('personImage', files.human_file || new Blob());
      formData.append('garmentImage', files.garment_file || new Blob());

      // Add item image if provided
      if (itemImage) {
        formData.append('itemImage', itemImage);
      }

      if (productTitle) {
        formData.append('productTitle', productTitle);
      }

      // Progress timer: 0% → 100% over 13 seconds
      startProgressTimer(0, 100, 13000);
      setStatus(t("productDetail.virtualFitting.aiAnalyzing"));

      const response = await fetch('/api/ai/virtual-fitting', {
        method: 'POST',
        body: formData,
      });

      clearProgressTimer(); // Clear timer when response is received

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to generate image');
      }

      setProgress(100);
      setStatus(t("productDetail.virtualFitting.videoGenerationComplete"));
      setGeneratedImage(result.imageUrl);

      // Call callback
      if (onResultGenerated) {
        onResultGenerated(result.imageUrl);
      }

      // Enable video generation if pro mode (only for V2)
      // V1: Video generation is disabled (동영상 서비스준비중)
      if (isProEnabled && useGeminiAPI) {
        setStatus(t("productDetail.virtualFitting.videoGenerationInProgress"));
        startProgressTimer(90, 100, 20000);

        try {
          const videoResult = await videoGeneration.mutateAsync({
            imageUrl: result.imageUrl,
            // Không truyền prompt để dùng default prompt từ API (giống V1)
            productTitle: productTitle,
          });

          if (videoResult.success && videoResult.data.videoUrl) {
            clearProgressTimer();
            setProgress(100);
            setStatus(t("productDetail.virtualFitting.videoGenerationComplete"));
            setGeneratedVideo(videoResult.data.videoUrl);
          } else {
            clearProgressTimer();
            setStatus(t("productDetail.virtualFitting.videoGenerationFailed") + ": " + t("productDetail.virtualFitting.unknownError"));
          }
        } catch {
          clearProgressTimer();
          setStatus(t("productDetail.virtualFitting.videoGenerationFailed"));
        }
      }

      setShowResults(true);
      setIsProcessing(false);

    } catch (error) {
      setStatus(t("productDetail.virtualFitting.unknownError") + ": " + (error instanceof Error ? error.message : t("productDetail.virtualFitting.unknownError")));
      setIsProcessing(false);
    }
  };

  // 워크플로우 직접 실행
  const runWorkflowDirect = async (formData: FormData) => {
    try {
      setProgress(0);
      setStatus(t("productDetail.virtualFitting.workflowStarting"));

      // 배경 이미지가 포함된 경우 더 긴 타임아웃 설정
      const hasBackground = formData.has("background_file");
      const timeoutDuration = hasBackground ? 120000 : 60000; // 배경 포함시 2분, 아니면 1분


      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

      // 이미지 생성 진행률을 20초 동안 0%에서 100%까지 점진적으로 증가
      startProgressTimer(0, 100, 20000);
      setStatus("AI와 통신 중...");

      const workflowResponse = await fetch(
        "/api/virtual-fitting/run_workflow",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      clearProgressTimer(); // 타이머 정리

      let workflowResult;
      const responseText = await workflowResponse.text();

      // Internal Server Error 특별 처리
      if (
        workflowResponse.status === 500 &&
        responseText.trim() === "Internal Server Error"
      ) {
        clearProgressTimer();
        const hasBackground = formData.has("background_file");
        if (hasBackground) {
          setStatus(t("productDetail.virtualFitting.backgroundProcessingError"));
        } else {
          setStatus(t("productDetail.virtualFitting.serverInternalError"));
        }
        return;
      }

      try {
        workflowResult = JSON.parse(responseText);
      } catch {
        // JSON 파싱 실패시 더 자세한 분석

        // HTML 응답인지 확인
        if (
          responseText.includes("<!DOCTYPE html>") ||
          responseText.includes("<html")
        ) {
          clearProgressTimer();
          setStatus(t("productDetail.virtualFitting.htmlResponse"));
          return;
        }

        // 성공적인 이미지 URL이 포함되어 있는지 확인
        const imageUrlMatch = responseText.match(
          /https:\/\/cdn\.klingai\.com\/[^\s"]+\.png/
        );
        if (imageUrlMatch) {
          // 이미지 URL을 찾았다면 성공으로 처리
          clearProgressTimer();
          setProgress(100);
          setStatus(t("productDetail.virtualFitting.videoGenerationComplete"));
          setGeneratedImage(imageUrlMatch[0]);

          // Call callback to add result to detailed images
          if (onResultGenerated) {
            onResultGenerated(imageUrlMatch[0]);
          }

          if (isProEnabled) {
            setStatus(t("productDetail.virtualFitting.videoGenerationInProgress"));
            startProgressTimer(90, 100, 10000);

            const proFormData = new FormData();
            proFormData.append("image_url", imageUrlMatch[0]);
            proFormData.append("connection_info", connectionInfoRef.current!);

            const proResponse = await fetch("/api/virtual-fitting/run_i2v", {
              method: "POST",
              body: proFormData,
            });

            let proResult;
            const proResponseText = await proResponse.text();

            try {
              proResult = JSON.parse(proResponseText);
            } catch {
              clearProgressTimer();
              setStatus(
                `${t("productDetail.virtualFitting.videoServerError")}: ${proResponseText.substring(0, 100)}...`
              );
              return;
            }

            if (proResponse.ok && proResult.video_url) {
              clearProgressTimer();
              setProgress(100);
              setStatus(t("productDetail.virtualFitting.videoGenerationComplete"));
              setGeneratedVideo(proResult.video_url);
            } else {
              clearProgressTimer();
              setStatus(
                t("productDetail.virtualFitting.videoGenerationFailed") + ": " + (proResult.error || t("productDetail.virtualFitting.unknownError"))
              );
            }
          } else {
            setProgress(100);
          }
          return;
        }

        // 배경 이미지 관련 에러 메시지 개선
        clearProgressTimer();
        const hasBackground = formData.has("background_file");
        if (hasBackground) {
          setStatus(t("productDetail.virtualFitting.backgroundProcessingError"));
        } else if (
          workflowResponse.status === 500 &&
          (responseText.includes("Internal Server Error") ||
            responseText.includes("Internal S"))
        ) {
          setStatus(t("productDetail.virtualFitting.humanImageRequirement"));
        } else {
          setStatus(
            `${t("productDetail.virtualFitting.serverResponseParseFailed")} (${workflowResponse.status
            }): ${responseText.substring(0, 100)}...`
          );
        }
        return;
      }

      if (workflowResponse.ok && workflowResult.image_url) {
        setProgress(100);
        setStatus(t("productDetail.virtualFitting.videoGenerationComplete"));
        setGeneratedImage(workflowResult.image_url);

        // Call callback to add result to detailed images
        if (onResultGenerated) {
          onResultGenerated(workflowResult.image_url);
        }

        // V1: Video generation is disabled (동영상 서비스준비중)
        // Only V2 can generate videos
        if (isProEnabled && useGeminiAPI) {
          setStatus(t("productDetail.virtualFitting.videoGenerationInProgress"));
          // 비디오 생성 진행률을 20초 동안 90%에서 100%까지 증가
          startProgressTimer(90, 100, 20000);

          try {
            // Use Google GenAI for video generation
            // Choose image based on user preference
            const imageForVideo = workflowResult.image_url;

            const videoResult = await videoGeneration.mutateAsync({
              imageUrl: imageForVideo,
              prompt: `Fashionshow turning: A model wearing ${productTitle || 'fashionable clothing'} turning and rotating 360 degrees on a runway. Fashion show presentation, professional model pose, smooth turning motion.`,
              productTitle: productTitle,
            });

            if (videoResult.success && videoResult.data.videoUrl) {
              clearProgressTimer();
              setProgress(100);
              setStatus(t("productDetail.virtualFitting.videoGenerationComplete"));
              setGeneratedVideo(videoResult.data.videoUrl);
            } else {
              clearProgressTimer();
              setStatus(t("productDetail.virtualFitting.videoGenerationFailed"));
            }
          } catch (error) {
            clearProgressTimer();
            setStatus(t("productDetail.virtualFitting.videoGenerationFailed") + ": " + (error as Error).message);
          }
        } else {
          setProgress(100);
        }
      } else {
        // 에러 메시지 개선
        clearProgressTimer();
        let errorMessage = t("productDetail.virtualFitting.imageGenerationFailed") + ": ";
        const hasBackground = formData.has("background_file");

        if (hasBackground) {
          errorMessage = t("productDetail.virtualFitting.backgroundProcessingError");
        } else if (
          workflowResponse.status === 500 &&
          (responseText.includes("Internal Server Error") ||
            responseText.includes("Internal S"))
        ) {
          errorMessage = "사람 이미지에 상반신이 최소한 포함되어야 합니다. 다른 이미지를 사용해주세요.";
        } else if (workflowResult.error) {
          errorMessage += workflowResult.error;
        } else {
          errorMessage += `HTTP ${workflowResponse.status}`;
        }

        setStatus(errorMessage);
      }
    } catch (error) {
      clearProgressTimer(); // 에러 발생 시 타이머 정리
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setStatus(t("productDetail.virtualFitting.requestTimeout"));
        } else {
          setStatus(t("productDetail.virtualFitting.networkError") + ": " + error.message);
        }
      } else {
        setStatus(t("productDetail.virtualFitting.unknownError"));
      }
    } finally {
      clearProgressTimer(); // 최종적으로 타이머 정리
      setIsProcessing(false);
    }
  };

  // 워크플로우 실행 (Original API)
  const runWorkflow = async () => {
    // For Original API: person and garment are REQUIRED
    // lower_file is optional
    if (!files.human_file || !files.garment_file) {
      alert(t("productDetail.virtualFitting.uploadModelAndTop"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setGeneratedImage("");
    setGeneratedVideo("");

    // 배경 이미지가 포함된 경우 사용자에게 알림
    const hasBackground = !!files.background_file;
    if (hasBackground) {
      setStatus(t("productDetail.virtualFitting.backgroundProcessing"));
    } else {
      setStatus(t("productDetail.virtualFitting.connecting"));
    }

    const formData = new FormData();
    if (files.human_file) formData.append("human_file", files.human_file);
    if (files.garment_file) formData.append("garment_file", files.garment_file);
    if (files.lower_file) formData.append("lower_file", files.lower_file);
    if (files.background_file)
      formData.append("background_file", files.background_file);

    try {
      // WebSocket 대신 직접 연결 정보 생성
      const connectionInfo = `${clientId}_${Date.now()}`;
      connectionInfoRef.current = connectionInfo;
      formData.append("connection_info", connectionInfo);
      formData.append("is_pro", isProEnabled.toString());

      setStatus(
        hasBackground
          ? t("productDetail.virtualFitting.workflowStartingWithBackground")
          : t("productDetail.virtualFitting.workflowStarting")
      );
      await runWorkflowDirect(formData);
    } catch (error) {
      clearProgressTimer();
      setStatus(t("productDetail.virtualFitting.connectionError") + ": " + (error as Error).message);
      setIsProcessing(false);
    }
  };

  const handleStartWorkflow = async () => {
    setShowResults(true);
    setIsProcessing(true);

    // Choose API based on user selection
    if (useGeminiAPI) {
      await runGeminiVirtualFitting();
    } else {
      await runWorkflow(); // Original EC2 API
    }
  };

  const resetComponent = () => {
    clearProgressTimer(); // 타이머 정리
    setShowResults(false);
    setGeneratedImage("");
    setGeneratedVideo("");
    setStatus("");
    setProgress(0);
    setIsProcessing(false);
  };

  useEffect(() => {
    // Capture ref values at the time the effect runs
    const timeoutId = timeoutRef.current;
    const intervalId = progressIntervalRef.current;

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 가상 피팅 헤더 (항상 표시) */}
      <Card
        className="mb-6 py-4"
        style={{
          background: "linear-gradient(270deg, #FF84CD, #F9CFB7)",
          backgroundSize: "200% 200%", // 이동 거리 확보
          animation: "gradientShift 8s ease-in-out infinite", // 더 부드럽게
        }}
      >
        <CardHeader
          className="cursor-pointer gap-0 "
          onClick={() => setIsOpen(!isOpen)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FF84CD] to-[#F9CFB7] rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              {t("productDetail.virtualFitting.title")}
              <Badge variant="secondary" className="ml-2">
                {useGeminiAPI ? 'BOGOFIT V2' : 'BOGOFIT V1'}
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* 가상 피팅 콘텐츠 (접기/펼치기) */}
      <div
        className={`transition-all duration-500 ease-in-out ${isOpen
          ? "max-h-none opacity-100 overflow-visible"
          : "max-h-0 opacity-0 overflow-hidden"
          }`}
      >
        <div
          className={`transition-all duration-700 ease-in-out ${showResults
            ? "flex flex-col md:grid md:grid-cols-2 gap-2"
            : "grid grid-cols-1"
            }`}
        >
          {/* 가상 피팅 입력 섹션 */}
          <Card
            className={`transition-all duration-700 ease-in-out ${showResults ? "md:transform md:-translate-x-2" : ""
              } order-1`}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t("productDetail.virtualFitting.imageUpload")}</CardTitle>
              {showResults && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetComponent}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI 엔진 선택 */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-3">{t("productDetail.virtualFitting.aiEngineSelection")}</p>
                <div className="space-y-3">
                  <div
                    onClick={() => setUseGeminiAPI(false)}
                    className={`flex items-start space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${!useGeminiAPI
                      ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                      : 'border-gray-300 bg-gray-50 opacity-60 hover:opacity-80 hover:border-gray-400'
                      }`}
                  >
                    <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!useGeminiAPI
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-400 bg-white'
                        }`}>
                        {!useGeminiAPI && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-base font-semibold ${!useGeminiAPI ? 'text-gray-900' : 'text-gray-500'}`}>BOGOFIT V1</span>
                        <Badge variant="outline" className={`text-xs ${!useGeminiAPI ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-400 border-gray-400 text-white'}`}>STABLE</Badge>
                        {useGeminiAPI && (
                          <span className="text-xs text-gray-400 ml-auto">{t("productDetail.virtualFitting.notSelected")}</span>
                        )}
                      </div>
                      <p className={`text-sm ${!useGeminiAPI ? 'text-gray-600' : 'text-gray-400'}`}>{t("productDetail.virtualFitting.v1Description")}</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setUseGeminiAPI(true)}
                    className={`flex items-start space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${useGeminiAPI
                      ? 'border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-200'
                      : 'border-gray-300 bg-gray-50 opacity-60 hover:opacity-80 hover:border-gray-400'
                      }`}
                  >
                    <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${useGeminiAPI
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-400 bg-white'
                        }`}>
                        {useGeminiAPI && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-base font-semibold ${useGeminiAPI ? 'text-gray-900' : 'text-gray-500'}`}>BOGOFIT V2</span>
                        <Badge variant="secondary" className={`text-xs ${useGeminiAPI ? 'text-white bg-purple-600 border-purple-600' : 'bg-gray-400 border-gray-400 text-white'}`}>NEW</Badge>
                        {!useGeminiAPI && (
                          <span className="text-xs text-gray-400 ml-auto">{t("productDetail.virtualFitting.notSelected")}</span>
                        )}
                      </div>
                      <p className={`text-sm ${useGeminiAPI ? 'text-gray-600' : 'text-gray-400'}`}>{t("productDetail.virtualFitting.v2Description")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3컬럼 파일 업로드 영역 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* 사람 이미지 */}
                <div className="flex flex-col space-y-3">
                  <div className="w-full max-w-sm mx-auto lg:max-w-none aspect-[9/16] min-h-[400px] max-h-[500px]">
                    <FileDropzone
                      onDrop={(file) => handleFileChange("human_file", file)}
                      preview={previews.human_file}
                      label={t("productDetail.virtualFitting.modelImage")}
                      required
                      description={t("productDetail.virtualFitting.fullBodyPhotoRecommended")}
                      sampleImages={humanSamples}
                      onSampleSelect={(imageSrc) =>
                        handleSampleSelect("human_file", imageSrc)
                      }
                      onClear={() => handleFileChange("human_file", null)}
                      type="model"
                      selectedSampleSrc={selectedSampleSrcs.human_file}
                    />
                  </div>

                  {/* 사람 이미지 오류 메시지 */}
                  {fileErrors.human_file && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">{t("productDetail.virtualFitting.uploadError")}</p>
                          <p className="mt-1">{fileErrors.human_file}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 상의 이미지 / 아이템 (V2) */}
                <div className="flex flex-col space-y-3">
                  <div className="w-full max-w-sm mx-auto lg:max-w-none aspect-[9/16] min-h-[400px] max-h-[500px]">
                    <FileDropzone
                      onDrop={(file) => handleFileChange("garment_file", file)}
                      preview={
                        previews.garment_file ||
                        (currentImage &&
                          (productCategory === "상의" ||
                            productCategory === "아우터" ||
                            productCategory === "원피스") &&
                          !files.garment_file
                          ? currentImage
                          : "")
                      }
                      label={t("productDetail.virtualFitting.topImage")}
                      required
                      description={t("productDetail.virtualFitting.required")}
                      sampleImages={garmentSamples}
                      onSampleSelect={(imageSrc) =>
                        handleSampleSelect("garment_file", imageSrc)
                      }
                      onClear={() => handleFileChange("garment_file", null)}
                      type="clothing"
                      selectedSampleSrc={selectedSampleSrcs.garment_file}
                      version={useGeminiAPI ? "v2" : "v1"}
                    />
                  </div>

                  {/* 상의 이미지 오류 메시지 */}
                  {fileErrors.garment_file && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">{t("productDetail.virtualFitting.uploadError")}</p>
                          <p className="mt-1">{fileErrors.garment_file}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 하의 이미지 (V1) / 아이템 이미지 (V2) */}
                {useGeminiAPI ? (
                  // V2: Item Image (itemImage)
                  <div className="flex flex-col space-y-3">
                    <div className="w-full max-w-sm mx-auto lg:max-w-none aspect-[9/16] min-h-[400px] max-h-[500px]">
                      <FileDropzone
                        onDrop={(file) => handleItemImageChange(file)}
                        preview={itemPreview}
                        label={t("productDetail.virtualFitting.itemImage")}
                        description={t("productDetail.virtualFitting.optional")}
                        sampleImages={itemSamples}
                        onSampleSelect={async (imageSrc) => {
                          // Convert imageSrc to File for itemImage
                          const file = await urlToFile(imageSrc, "item-sample.png");
                          if (file) {
                            handleItemImageChange(file);
                          }
                          setSelectedSampleSrcs((prev) => ({ ...prev, lower_file: imageSrc }));
                        }}
                        onClear={() => handleItemImageChange(null)}
                        type="clothing"
                        selectedSampleSrc={selectedSampleSrcs.lower_file}
                        version="v2"
                      />
                    </div>
                  </div>
                ) : (
                  // V1: 하의 이미지 (lower_file)
                  <div className="flex flex-col space-y-3">
                    <div className="w-full max-w-sm mx-auto lg:max-w-none aspect-[9/16] min-h-[400px] max-h-[500px]">
                      <FileDropzone
                        onDrop={(file) => handleFileChange("lower_file", file)}
                        preview={
                          previews.lower_file ||
                          (currentImage &&
                            productCategory === "하의" &&
                            !files.lower_file
                            ? currentImage
                            : "")
                        }
                        label={t("productDetail.virtualFitting.bottomImage")}
                        description={t("productDetail.virtualFitting.optional")}
                        sampleImages={lowerSamples}
                        onSampleSelect={(imageSrc) =>
                          handleSampleSelect("lower_file", imageSrc)
                        }
                        onClear={() => handleFileChange("lower_file", null)}
                        type="clothing"
                        selectedSampleSrc={selectedSampleSrcs.lower_file}
                        version="v1"
                      />
                    </div>

                    {/* 하의 이미지 오류 메시지 */}
                    {fileErrors.lower_file && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-red-800">
                            <p className="font-medium">{t("productDetail.virtualFitting.uploadError")}</p>
                            <p className="mt-1">{fileErrors.lower_file}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 안내 섹션 - flex 열로 배치 */}
              <div className="flex flex-col gap-4">
                {/* 파일 업로드 가이드 */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">{t("productDetail.virtualFitting.fileUploadGuide")}</p>
                    <ul className="space-y-1 text-xs">
                      <li>• {t("productDetail.virtualFitting.supportedFormats")}</li>
                      <li>• {t("productDetail.virtualFitting.modelImageRecommendation")}</li>
                      <li>• {t("productDetail.virtualFitting.apparelImageRecommendation")}</li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* 옵션 및 실행 버튼 */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_pro"
                    checked={isProEnabled}
                    onChange={(e) => setIsProEnabled(e.target.checked)}
                    disabled={!useGeminiAPI}
                    className="rounded"
                  />
                  <label htmlFor="is_pro" className="text-sm font-medium">
                    {t("productDetail.virtualFitting.aiVideoGeneration").replace("{version}", useGeminiAPI ? 'BOGOFIT V2' : 'BOGOFIT V1')}
                    <Badge variant="outline" className="ml-2 text-xs">
                      AI
                    </Badge>
                    <span className="ml-2 text-xs text-gray-500">
                      {useGeminiAPI ? t("productDetail.virtualFitting.videoAvailable") : t("productDetail.virtualFitting.videoServiceInPreparation")}
                    </span>
                  </label>
                </div>

                <Button
                  onClick={handleStartWorkflow}
                  disabled={
                    isProcessing ||
                    // Both V1 and V2: person and garment are REQUIRED
                    // lower_file and itemImage are optional
                    (!files.human_file || !files.garment_file) ||
                    !!fileErrors.human_file ||
                    !!fileErrors.garment_file ||
                    !!fileErrors.lower_file ||
                    !!fileErrors.background_file
                  }
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-14 md:text-base lg:text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center mb-2">
                        <Play className="w-4 h-4 mr-2" />
                        {t("productDetail.virtualFitting.processing")} {progress}%
                      </div>
                      <Progress value={progress} className="w-full h-2" />
                    </div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {t("productDetail.virtualFitting.startVirtualFitting")}
                    </>
                  )}
                </Button>
              </div>

              {/* 상태 표시 */}
              {status && (
                <div
                  className={`p-3 rounded-lg ${status.includes("실패") ||
                    status.includes("오류") ||
                    status.includes("상                        반신")
                    ? "bg-red-50 border border-red-200"
                    : status.includes("완료")
                      ? "bg-green-50 border border-gre en-200"
                      : "bg-blue-50 border border-blue-200"
                    }`}
                >
                  <p
                    className={`text-sm ${status.includes("실패") ||
                      status.includes("오류") ||
                      status.includes("상반신")
                      ? "text-red-800"
                      : status.includes("완료")
                        ? "text-green-800"
                        : "text-blue-800"
                      }`}
                  >
                    {status}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 결과 섹션 - 레이아웃 없이 이미지만 표시 */}
          {showResults && (
            <div
              className={`transition-all duration-700 ease-in-out transform order-2 ${showResults
                ? "translate-x-0 opacity-100 md:translate-x-2"
                : "translate-x-full opacity-0"
                }`}
            >
              {/* 로딩 상태 표시 */}
              {isProcessing && !generatedImage && (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full max-w-md">
                      <Progress value={progress} className="w-full h-4" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-800 mb-2">
                        {t("productDetail.virtualFitting.aiGenerating")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {progress}% {t("productDetail.virtualFitting.complete")}
                      </p>
                    </div>
                  </div>

                  {/* Skeleton Loading */}
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                            <Play className="w-8 h-8 text-pink-500" />
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {t("productDetail.virtualFitting.aiGeneratingYourImage")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {status || t("productDetail.virtualFitting.processing") + "..."}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          {t("productDetail.virtualFitting.highQualityImageNote")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 생성된 이미지 */}
              {generatedImage && (
                <div className="relative">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-spin">
                          <Play className="w-6 h-6 text-pink-500" />
                        </div>
                        <p className="text-sm text-gray-600">이미지 로딩 중...</p>
                      </div>
                    </div>
                  )}
                  <img
                    src={generatedImage}
                    alt={"생성된 가상 피팅 이미지"}
                    className="w-full h-auto rounded-lg shadow-lg"
                    onLoadStart={() => setImageLoading(true)}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={() => {
                      const filename = `virtual-fitting-${Date.now()}.png`;
                      downloadFile(generatedImage, filename);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* 비디오 생성 로딩 상태 */}
              {isProEnabled &&
                useGeminiAPI &&
                generatedImage &&
                isProcessing &&
                !generatedVideo && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4 mt-6">
                    <div className="w-full max-w-xs">
                      <Progress value={progress} className="w-full h-3" />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      {`${useGeminiAPI ? 'BOGOFIT V2' : 'BOGOFIT V1'}가 비디오를 생성하고 있습니다...`} {progress}%
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700 text-center">
                        🎬 비디오를 생성 중입니다... 잠시만 기다려주세요
                      </p>
                    </div>
                  </div>
                )}

              {/* 생성된 비디오 */}
              {generatedVideo && (
                <div className="mt-6">
                  {/* Video container - centered with max width for vertical video */}
                  <div className="flex justify-center items-center">
                    <div className="relative w-full max-w-sm mx-auto rounded-xl overflow-hidden shadow-2xl border-2 border-gray-200 bg-black" style={{ aspectRatio: '9/16' }}>
                      <video
                        src={generatedVideo}
                        controls
                        loop
                        muted
                        autoPlay
                        playsInline
                        className="w-full h-full"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                          margin: 0,
                          padding: 0,
                          aspectRatio: '9/16'
                        }}
                        onError={(e) => {
                          const videoElement = e.target as HTMLVideoElement;

                          // If it's a direct Google API URL, try proxy
                          if (generatedVideo.includes('generativelanguage.googleapis.com')) {
                            const proxyUrl = `/api/ai/video-proxy?url=${encodeURIComponent(generatedVideo)}`;
                            if (videoElement.src !== window.location.origin + proxyUrl) {
                              videoElement.src = proxyUrl;
                              return;
                            }
                          }

                          // Fallback to sample video if proxy also fails
                          videoElement.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
                        }}
                      />

                      {/* Download button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
                        onClick={() => {
                          const filename = `virtual-fitting-video-${Date.now()}.mp4`;
                          downloadFile(generatedVideo, filename);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}