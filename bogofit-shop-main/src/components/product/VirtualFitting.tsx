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
} from "@/contents/VirtualFitting/sampleImages";
import { useI18n } from "@/providers/I18nProvider";

interface VirtualFittingProps {
  productTitle?: string;
  productCategory?: string;
  currentImage?: string; // 현재 선택된 메인 이미지
}

export default function VirtualFitting({
  productTitle,
  productCategory,
  currentImage,
}: VirtualFittingProps) {
  const { t } = useI18n();
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

  const [isProEnabled, setIsProEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [showResults, setShowResults] = useState(false);

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

  // 진행률 점진적 증가 함수
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
      const currentProgress = startProgress + progressDiff * progressRatio;

      setProgress(Math.round(currentProgress));

      if (progressRatio >= 1) {
        clearInterval(progressIntervalRef.current!);
        progressIntervalRef.current = null;
      }
    }, 100); // 100ms마다 업데이트
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
      return t("virtualFitting.errors.unsupportedFormat");
    }

    return "";
  };

  // 이미지 URL을 File 객체로 변환하는 함수 (프록시 사용)
  const urlToFile = async (
    url: string,
    filename: string
  ): Promise<File | null> => {
    try {
      // 로컬 이미지인 경우 직접 사용
      if (url.startsWith("/")) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`${t("virtualFitting.errors.imageLoadFailed")}: ${response.status}`);
        }

        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type || "image/jpeg" });
      }

      // 외부 이미지인 경우 프록시 사용
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`${t("virtualFitting.errors.proxyRequestFailed")}: ${response.status}`);
      }

      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type || "image/jpeg" });
    } catch (error) {
      console.error(t("virtualFitting.errors.imageDownloadFailed"), error);
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
        } catch (error) {
          console.error(t("virtualFitting.errors.autoUploadFailed"), error);
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
          [fieldName]: t("virtualFitting.errors.fileReadError"),
        }));
      };

      // 이미지 파일인지 추가 검증
      const img = new Image();

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
          [fieldName]: t("virtualFitting.errors.invalidImageFile"),
        }));
      };
    } else {
      // 파일이 null인 경우 프리뷰도 초기화
      setFiles((prev) => ({ ...prev, [fieldName]: null }));
      setPreviews((prev) => ({ ...prev, [fieldName]: "" }));
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
  };

  // 워크플로우 직접 실행
  const runWorkflowDirect = async (formData: FormData) => {
    try {
      setProgress(5);
      setStatus(t("virtualFitting.status.generatingImage"));

      // 배경 이미지가 포함된 경우 더 긴 타임아웃 설정
      const hasBackground = formData.has("background_file");
      const timeoutDuration = hasBackground ? 120000 : 60000; // 배경 포함시 2분, 아니면 1분

      // FormData 내용 로깅 (디버깅용)
      console.log(t("virtualFitting.logs.sendingFiles"));
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: ${value.name} (${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

      // 이미지 생성 진행률을 19초 동안 5%에서 100%까지 점진적으로 증가
      startProgressTimer(5, 100, 19000);
      setStatus(t("virtualFitting.status.communicatingAI"));

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

      // 응답 로깅 (디버깅용)
      console.log(t("virtualFitting.logs.serverResponse"), workflowResponse.status);
      console.log(
        t("virtualFitting.logs.serverHeaders"),
        Object.fromEntries(workflowResponse.headers.entries())
      );
      console.log(
        t("virtualFitting.logs.serverText"),
        responseText.substring(0, 500)
      );

      // Internal Server Error 특별 처리
      if (
        workflowResponse.status === 500 &&
        responseText.trim() === "Internal Server Error"
      ) {
        clearProgressTimer();
        const hasBackground = formData.has("background_file");
        if (hasBackground) {
          setStatus(t("virtualFitting.errors.backgroundProcessingError"));
        } else {
          setStatus(t("virtualFitting.errors.serverInternalError"));
        }
        return;
      }

      try {
        workflowResult = JSON.parse(responseText);
      } catch (parseError) {
        // JSON 파싱 실패시 더 자세한 분석
        console.error(t("virtualFitting.errors.jsonParsingFailed"), parseError);
        console.error(t("virtualFitting.logs.responseFullText"), responseText);

        // HTML 응답인지 확인
        if (
          responseText.includes("<!DOCTYPE html>") ||
          responseText.includes("<html")
        ) {
          clearProgressTimer();
          setStatus(t("virtualFitting.errors.htmlResponse"));
          return;
        }

        // 성공적인 이미지 URL이 포함되어 있는지 확인
        const imageUrlMatch = responseText.match(
          /https:\/\/cdn\.klingai\.com\/[^\s"]+\.png/
        );
        if (imageUrlMatch) {
          // 이미지 URL을 찾았다면 성공으로 처리
          console.log(t("virtualFitting.logs.imageUrlExtracted"), imageUrlMatch[0]);
          clearProgressTimer();
          setProgress(90);
          setStatus(t("virtualFitting.status.imageGenerationComplete"));
          setGeneratedImage(imageUrlMatch[0]);

          if (isProEnabled) {
            setStatus(t("virtualFitting.status.generatingVideo"));
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
                `${t("virtualFitting.errors.videoGenerationServerError")}: ${proResponseText.substring(0, 100)}...`
              );
              return;
            }

            if (proResponse.ok && proResult.video_url) {
              clearProgressTimer();
              setProgress(100);
              setStatus(t("virtualFitting.status.videoGenerationComplete"));
              setGeneratedVideo(proResult.video_url);
            } else {
              clearProgressTimer();
              setStatus(
                t("virtualFitting.errors.videoGenerationFailed") + ": " + (proResult.error || t("virtualFitting.errors.unknownError"))
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
          setStatus(t("virtualFitting.errors.backgroundProcessingErrorGeneric"));
        } else if (
          workflowResponse.status === 500 &&
          (responseText.includes("Internal Server Error") ||
            responseText.includes("Internal S"))
        ) {
          setStatus(t("virtualFitting.errors.minimumUpperBody"));
        } else {
          setStatus(
            `${t("virtualFitting.errors.serverResponseParsingFailed")} (${
              workflowResponse.status
            }): ${responseText.substring(0, 100)}...`
          );
        }
        return;
      }

      if (workflowResponse.ok && workflowResult.image_url) {
        setProgress(90);
        setStatus(t("virtualFitting.status.imageGenerationComplete"));
        setGeneratedImage(workflowResult.image_url);

        if (isProEnabled) {
          setStatus(t("virtualFitting.status.generatingVideo"));
          // 비디오 생성 진행률을 10초 동안 90%에서 100%까지 증가
          startProgressTimer(90, 100, 10000);

          const proFormData = new FormData();
          proFormData.append("image_url", workflowResult.image_url);
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
              `${t("virtualFitting.errors.videoGenerationServerError")}: ${proResponseText.substring(0, 100)}...`
            );
            return;
          }

          if (proResponse.ok && proResult.video_url) {
            clearProgressTimer();
            setProgress(100);
            setStatus(t("virtualFitting.status.videoGenerationComplete"));
            setGeneratedVideo(proResult.video_url);
          } else {
            clearProgressTimer();
            setStatus(
              t("virtualFitting.errors.videoGenerationFailed") + ": " + (proResult.error || t("virtualFitting.errors.unknownError"))
            );
          }
        } else {
          setProgress(100);
        }
      } else {
        // 에러 메시지 개선
        clearProgressTimer();
        let errorMessage = t("virtualFitting.errors.imageGenerationFailed") + ": ";
        const hasBackground = formData.has("background_file");

        if (hasBackground) {
          errorMessage = t("virtualFitting.errors.backgroundProcessingErrorRetry");
        } else if (
          workflowResponse.status === 500 &&
          (responseText.includes("Internal Server Error") ||
            responseText.includes("Internal S"))
        ) {
          errorMessage = t("virtualFitting.errors.minimumUpperBody");
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
          setStatus(t("virtualFitting.errors.requestTimeout"));
        } else {
          setStatus(t("virtualFitting.errors.networkError") + ": " + error.message);
        }
      } else {
        setStatus(t("virtualFitting.errors.unknownError"));
      }
    } finally {
      clearProgressTimer(); // 최종적으로 타이머 정리
      setIsProcessing(false);
    }
  };

  // 워크플로우 실행
  const runWorkflow = async () => {
    if (!files.human_file || !files.garment_file) {
      alert(t("virtualFitting.alerts.uploadRequiredFiles"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setGeneratedImage("");
    setGeneratedVideo("");

    // 배경 이미지가 포함된 경우 사용자에게 알림
    const hasBackground = !!files.background_file;
    if (hasBackground) {
      setStatus(t("virtualFitting.status.backgroundWarning"));
    } else {
      setStatus(t("virtualFitting.status.connecting"));
    }

    const formData = new FormData();
    formData.append("human_file", files.human_file);
    formData.append("garment_file", files.garment_file);
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
          ? t("virtualFitting.status.startingWorkflowWithBackground")
          : t("virtualFitting.status.startingWorkflow")
      );
      await runWorkflowDirect(formData);
    } catch (error) {
      clearProgressTimer();
      setStatus(t("virtualFitting.errors.connectionError") + ": " + (error as Error).message);
      setIsProcessing(false);
    }
  };

  const handleStartWorkflow = async () => {
    setShowResults(true);
    await runWorkflow();
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
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
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
              {t("virtualFitting.title")}
              <Badge variant="secondary" className="ml-2">
                AI
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
        className={`transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-none opacity-100 overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div
          className={`transition-all duration-700 ease-in-out ${
            showResults
              ? "flex flex-col md:grid md:grid-cols-2 gap-2"
              : "grid grid-cols-1"
          }`}
        >
          {/* 가상 피팅 입력 섹션 */}
          <Card
            className={`transition-all duration-700 ease-in-out ${
              showResults ? "md:transform md:-translate-x-2" : ""
            } order-1`}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t("virtualFitting.uploadTitle")}</CardTitle>
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
              {/* 3컬럼 파일 업로드 영역 - 최적화된 레이아웃 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* 사람 이미지 */}
                <div className="flex flex-col space-y-3">
                  <div className="w-full max-w-sm mx-auto lg:max-w-none aspect-[9/16] min-h-[400px] max-h-[500px]">
                    <FileDropzone
                      onDrop={(file) => handleFileChange("human_file", file)}
                      preview={previews.human_file}
                      label={t("virtualFitting.labels.modelImage")}
                      required
                      description={t("virtualFitting.descriptions.modelImage")}
                      sampleImages={humanSamples}
                      onSampleSelect={(imageSrc) =>
                        handleSampleSelect("human_file", imageSrc)
                      }
                      onClear={() => handleFileChange("human_file", null)}
                      type="model"
                    />
                  </div>

                  {/* 사람 이미지 오류 메시지 */}
                  {fileErrors.human_file && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">{t("virtualFitting.errors.uploadError")}</p>
                          <p className="mt-1">{fileErrors.human_file}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 상의 이미지 */}
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
                      label={t("virtualFitting.labels.topImage")}
                      required
                      description="&nbsp;"
                      sampleImages={garmentSamples}
                      onSampleSelect={(imageSrc) =>
                        handleSampleSelect("garment_file", imageSrc)
                      }
                      onClear={() => handleFileChange("garment_file", null)}
                      type="clothing"
                    />
                  </div>

                  {/* 상의 이미지 오류 메시지 */}
                  {fileErrors.garment_file && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">{t("virtualFitting.errors.uploadError")}</p>
                          <p className="mt-1">{fileErrors.garment_file}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 하의 이미지 */}
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
                      label={t("virtualFitting.labels.bottomImage")}
                      description="&nbsp;"
                      sampleImages={lowerSamples}
                      onSampleSelect={(imageSrc) =>
                        handleSampleSelect("lower_file", imageSrc)
                      }
                      onClear={() => handleFileChange("lower_file", null)}
                      type="clothing"
                    />
                  </div>

                  {/* 하의 이미지 오류 메시지 */}
                  {fileErrors.lower_file && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">{t("virtualFitting.errors.uploadError")}</p>
                          <p className="mt-1">{fileErrors.lower_file}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 안내 섹션 - flex 열로 배치 */}
              <div className="flex flex-col gap-4">
                {/* 파일 업로드 가이드 */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">{t("virtualFitting.guide.title")}</p>
                    <ul className="space-y-1 text-xs">
                      <li>• {t("virtualFitting.guide.supportedFormats")}</li>
                      <li>• {t("virtualFitting.guide.humanImage")}</li>
                      <li>• {t("virtualFitting.guide.clothingImage")}</li>
                    </ul>
                  </div>
                </div>

                {/* 배경 이미지 기능 일시 중단 안내 */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{t("virtualFitting.backgroundDisabled.title")}</p>
                      <p className="mt-1 text-xs">
                        {t("virtualFitting.backgroundDisabled.description")}
                      </p>
                    </div>
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
                    className="rounded"
                  />
                  <label htmlFor="is_pro" className="text-sm font-medium">
                    {t("virtualFitting.options.aiVideoGeneration")}
                    <Badge variant="outline" className="ml-2 text-xs">
                      PRO
                    </Badge>
                  </label>
                </div>

                <Button
                  onClick={handleStartWorkflow}
                  disabled={
                    isProcessing ||
                    !files.human_file ||
                    !files.garment_file ||
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
                        {t("virtualFitting.processing")} {progress}%
                      </div>
                      <Progress value={progress} className="w-full h-2" />
                    </div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {t("virtualFitting.startButton")}
                    </>
                  )}
                </Button>
              </div>

              {/* 상태 표시 */}
              {status && (
                <div
                  className={`p-3 rounded-lg ${
                    status.includes("실패") ||
                    status.includes("오류") ||
                    status.includes("상반신")
                      ? "bg-red-50 border border-red-200"
                      : status.includes("완료")
                        ? "bg-green-50 border border-green-200"
                        : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      status.includes("실패") ||
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
              className={`transition-all duration-700 ease-in-out transform order-2 ${
                showResults
                  ? "translate-x-0 opacity-100 md:translate-x-2"
                  : "translate-x-full opacity-0"
              }`}
            >
              {/* 로딩 상태 표시 */}
              {isProcessing && !generatedImage && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-full max-w-xs">
                    <Progress value={progress} className="w-full h-3" />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    {t("virtualFitting.aiGeneratingImage")}
                    <br />
                    {t("virtualFitting.pleaseWait")} {progress}%
                  </p>
                </div>
              )}

              {/* 생성된 이미지 */}
              {generatedImage && (
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt={t("virtualFitting.generatedImageAlt")}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={() => window.open(generatedImage, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* 비디오 생성 로딩 상태 */}
              {isProEnabled &&
                generatedImage &&
                isProcessing &&
                !generatedVideo && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4 mt-6">
                    <div className="w-full max-w-xs">
                      <Progress value={progress} className="w-full h-3" />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      {t("virtualFitting.aiGeneratingVideo")} {progress}%
                    </p>
                  </div>
                )}

              {/* 생성된 비디오 */}
              {generatedVideo && (
                <div className="relative mt-6">
                  <video
                    src={generatedVideo}
                    controls
                    loop
                    muted
                    autoPlay
                    className="w-full rounded-lg shadow-lg"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={() => window.open(generatedVideo, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
