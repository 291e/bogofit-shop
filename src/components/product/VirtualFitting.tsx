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
  backgroundSamples,
} from "@/contents/VirtualFitting/sampleImages";

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
  const [isOpen, setIsOpen] = useState(false);
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
    // 파일 크기 검사 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "파일 크기가 10MB를 초과했습니다. 더 작은 이미지를 사용해주세요.";
    }

    // 파일 형식 검사
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "지원하지 않는 파일 형식입니다. JPG, PNG, WEBP 파일만 업로드 가능합니다.";
    }

    // 최소 파일 크기 검사 (너무 작은 파일 방지)
    const minSize = 1024; // 1KB
    if (file.size < minSize) {
      return "파일이 너무 작습니다. 유효한 이미지 파일을 업로드해주세요.";
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
          throw new Error(`이미지 로드 실패: ${response.status}`);
        }

        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type || "image/jpeg" });
      }

      // 외부 이미지인 경우 프록시 사용
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`프록시 요청 실패: ${response.status}`);
      }

      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type || "image/jpeg" });
    } catch (error) {
      console.error("이미지 다운로드 실패:", error);
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
          console.error("자동 업로드 실패:", error);
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
          [fieldName]:
            "파일을 읽는 중 오류가 발생했습니다. 다른 이미지를 시도해주세요.",
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
          [fieldName]:
            "손상되었거나 유효하지 않은 이미지 파일입니다. 다른 이미지를 선택해주세요.",
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
      setStatus("이미지 생성 중...");

      // 배경 이미지가 포함된 경우 더 긴 타임아웃 설정
      const hasBackground = formData.has("background_file");
      const timeoutDuration = hasBackground ? 120000 : 60000; // 배경 포함시 2분, 아니면 1분

      // FormData 내용 로깅 (디버깅용)
      console.log("전송할 파일 정보:");
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
      setStatus("AI 서버와 통신 중...");

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
      console.log("서버 응답 상태:", workflowResponse.status);
      console.log(
        "서버 응답 헤더:",
        Object.fromEntries(workflowResponse.headers.entries())
      );
      console.log(
        "서버 응답 텍스트 (처음 500자):",
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
          setStatus(
            "배경 이미지 처리 중 서버 오류가 발생했습니다. 배경 이미지 없이 다시 시도해보세요."
          );
        } else {
          setStatus(
            "서버 내부 오류가 발생했습니다. 이미지 품질을 확인하고 다시 시도해주세요."
          );
        }
        return;
      }

      try {
        workflowResult = JSON.parse(responseText);
      } catch (parseError) {
        // JSON 파싱 실패시 더 자세한 분석
        console.error("JSON 파싱 실패:", parseError);
        console.error("응답 전체 텍스트:", responseText);

        // HTML 응답인지 확인
        if (
          responseText.includes("<!DOCTYPE html>") ||
          responseText.includes("<html")
        ) {
          clearProgressTimer();
          setStatus(
            "서버에서 HTML 응답을 반환했습니다. 관리자에게 문의하세요."
          );
          return;
        }

        // 성공적인 이미지 URL이 포함되어 있는지 확인
        const imageUrlMatch = responseText.match(
          /https:\/\/cdn\.klingai\.com\/[^\s"]+\.png/
        );
        if (imageUrlMatch) {
          // 이미지 URL을 찾았다면 성공으로 처리
          console.log("응답에서 이미지 URL 추출:", imageUrlMatch[0]);
          clearProgressTimer();
          setProgress(90);
          setStatus("이미지 생성 완료!");
          setGeneratedImage(imageUrlMatch[0]);

          if (isProEnabled) {
            setStatus("비디오 생성 중...");
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
                `비디오 생성 서버 오류: ${proResponseText.substring(0, 100)}...`
              );
              return;
            }

            if (proResponse.ok && proResult.video_url) {
              clearProgressTimer();
              setProgress(100);
              setStatus("비디오 생성 완료!");
              setGeneratedVideo(proResult.video_url);
            } else {
              clearProgressTimer();
              setStatus(
                "비디오 생성 실패: " + (proResult.error || "알 수 없는 오류")
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
          setStatus(
            "배경 이미지 처리 중 오류가 발생했습니다. 배경 이미지 없이 시도해보세요."
          );
        } else if (
          workflowResponse.status === 500 &&
          (responseText.includes("Internal Server Error") ||
            responseText.includes("Internal S"))
        ) {
          setStatus("사람 이미지는 최소한 상반신을 포함하여 올려주세요!");
        } else {
          setStatus(
            `서버 응답 파싱 실패 (${
              workflowResponse.status
            }): ${responseText.substring(0, 100)}...`
          );
        }
        return;
      }

      if (workflowResponse.ok && workflowResult.image_url) {
        setProgress(90);
        setStatus("이미지 생성 완료!");
        setGeneratedImage(workflowResult.image_url);

        if (isProEnabled) {
          setStatus("비디오 생성 중...");
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
              `비디오 생성 서버 오류: ${proResponseText.substring(0, 100)}...`
            );
            return;
          }

          if (proResponse.ok && proResult.video_url) {
            clearProgressTimer();
            setProgress(100);
            setStatus("비디오 생성 완료!");
            setGeneratedVideo(proResult.video_url);
          } else {
            clearProgressTimer();
            setStatus(
              "비디오 생성 실패: " + (proResult.error || "알 수 없는 오류")
            );
          }
        } else {
          setProgress(100);
        }
      } else {
        // 에러 메시지 개선
        clearProgressTimer();
        let errorMessage = "이미지 생성 실패: ";
        const hasBackground = formData.has("background_file");

        if (hasBackground) {
          errorMessage =
            "배경 이미지 처리 중 오류가 발생했습니다. 배경 이미지를 제거하고 다시 시도해보세요.";
        } else if (
          workflowResponse.status === 500 &&
          (responseText.includes("Internal Server Error") ||
            responseText.includes("Internal S"))
        ) {
          errorMessage = "사람 이미지는 최소한 상반신을 포함하여 올려주세요!";
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
          setStatus("요청 시간이 초과되었습니다. 다시 시도해주세요.");
        } else {
          setStatus("네트워크 오류: " + error.message);
        }
      } else {
        setStatus("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      clearProgressTimer(); // 최종적으로 타이머 정리
      setIsProcessing(false);
    }
  };

  // 워크플로우 실행
  const runWorkflow = async () => {
    if (!files.human_file || !files.garment_file) {
      alert("필수 파일을 모두 업로드해주세요.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setGeneratedImage("");
    setGeneratedVideo("");

    // 배경 이미지가 포함된 경우 사용자에게 알림
    const hasBackground = !!files.background_file;
    if (hasBackground) {
      setStatus("배경 이미지 포함으로 처리 시간이 더 오래 걸릴 수 있습니다...");
    } else {
      setStatus("연결 중...");
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
          ? "배경 합성을 포함한 워크플로우 시작 중..."
          : "워크플로우 시작 중..."
      );
      await runWorkflowDirect(formData);
    } catch (error) {
      clearProgressTimer();
      setStatus("연결 오류: " + (error as Error).message);
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
        className="mb-4"
        style={{
          background: "linear-gradient(270deg, #a855f7, #ec4899)",
          backgroundSize: "200% 200%", // 이동 거리 확보
          animation: "gradientShift 8s ease-in-out infinite", // 더 부드럽게
        }}
      >
        <CardHeader
          className="cursor-pointer "
          onClick={() => setIsOpen(!isOpen)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              가상 피팅
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
              ? "flex flex-col md:grid md:grid-cols-2 gap-6"
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
              <CardTitle className="text-lg">이미지 업로드</CardTitle>
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
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* 필수 파일들 */}
                <div className="flex-1 space-y-3">
                  <FileDropzone
                    onDrop={(file) => handleFileChange("human_file", file)}
                    preview={previews.human_file}
                    label="사람 이미지"
                    required
                    description="최소한 상반신이 포함된 사진을 업로드해주세요"
                    sampleImages={humanSamples}
                    onSampleSelect={(imageSrc) =>
                      handleSampleSelect("human_file", imageSrc)
                    }
                    onClear={() => handleFileChange("human_file", null)}
                  />

                  {/* 사람 이미지 오류 메시지 */}
                  {fileErrors.human_file && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">업로드 오류</p>
                          <p className="mt-1">{fileErrors.human_file}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <FileDropzone
                    onDrop={(file) => handleFileChange("garment_file", file)}
                    preview={
                      previews.garment_file ||
                      (currentImage &&
                      (productCategory === "상의" ||
                        productCategory === "아우터" ||
                        productCategory === "원피스") &&
                      !files.garment_file // 파일이 해제되지 않은 경우만 currentImage 표시
                        ? currentImage
                        : "")
                    }
                    label="상의 이미지"
                    required
                    sampleImages={garmentSamples}
                    onSampleSelect={(imageSrc) =>
                      handleSampleSelect("garment_file", imageSrc)
                    }
                    onClear={() => handleFileChange("garment_file", null)}
                  />

                  {/* 상의 이미지 오류 메시지 */}
                  {fileErrors.garment_file && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">업로드 오류</p>
                          <p className="mt-1">{fileErrors.garment_file}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 선택 파일들 */}
                <div className="flex-1 space-y-3">
                  <FileDropzone
                    onDrop={(file) => handleFileChange("lower_file", file)}
                    preview={
                      previews.lower_file ||
                      (currentImage &&
                      productCategory === "하의" &&
                      !files.lower_file // 파일이 해제되지 않은 경우만 currentImage 표시
                        ? currentImage
                        : "")
                    }
                    label="하의 이미지 (선택)"
                    description="&nbsp;"
                    sampleImages={lowerSamples}
                    onSampleSelect={(imageSrc) =>
                      handleSampleSelect("lower_file", imageSrc)
                    }
                    onClear={() => handleFileChange("lower_file", null)}
                  />

                  {/* 하의 이미지 오류 메시지 */}
                  {fileErrors.lower_file && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">업로드 오류</p>
                          <p className="mt-1">{fileErrors.lower_file}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 배경 이미지 업로드 - 일시적으로 비활성화 */}
                  {false && ( // TODO: 서버 오류 수정 후 true로 변경
                    <>
                      <FileDropzone
                        onDrop={(file) =>
                          handleFileChange("background_file", file)
                        }
                        preview={previews.background_file}
                        label="배경 이미지 (선택)"
                        description="처리 시간이 더 오래 걸릴 수 있습니다"
                        sampleImages={backgroundSamples}
                        onSampleSelect={(imageSrc) =>
                          handleSampleSelect("background_file", imageSrc)
                        }
                        onClear={() =>
                          handleFileChange("background_file", null)
                        }
                      />

                      {/* 배경 이미지 오류 메시지 */}
                      {fileErrors.background_file && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-red-800">
                              <p className="font-medium">업로드 오류</p>
                              <p className="mt-1">
                                {fileErrors.background_file}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 배경 이미지 사용 시 주의사항 */}
                      {files.background_file && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-yellow-800">
                              <p className="font-medium">
                                배경 이미지 사용 시 주의사항:
                              </p>
                              <ul className="mt-1 space-y-1 text-xs">
                                <li>
                                  • 처리 시간이 최대 2분까지 소요될 수 있습니다
                                </li>
                                <li>
                                  • 서버 오류 발생 시 배경 이미지를 제거하고
                                  다시 시도해주세요
                                </li>
                              </ul>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleFileChange("background_file", null)
                                }
                                className="mt-2 h-6 text-xs bg-white"
                              >
                                배경 이미지 제거
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* 배경 이미지 비활성화 안내 */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">
                          배경 이미지 기능 일시 중단
                        </p>
                        <p className="mt-1 text-xs">
                          서버 안정성을 위해 배경 이미지 업로드 기능을
                          일시적으로 비활성화했습니다.
                          <br />
                          기본 가상 피팅 기능은 정상적으로 사용 가능합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 파일 업로드 도움말 */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">📝 파일 업로드 가이드</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 지원 형식: JPG, PNG</li>
                    <li>• 최대 파일 크기: 10MB</li>
                    <li>• 사람 이미지: 최소한 상반신이 포함된 선명한 사진</li>
                    <li>
                      • 의류 이미지: 배경이 깔끔하고 의류가 잘 보이는 사진
                    </li>
                  </ul>
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
                    AI 비디오 생성 활성화
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
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center mb-2">
                        <Play className="w-4 h-4 mr-2" />
                        처리 중... {progress}%
                      </div>
                      <Progress value={progress} className="w-full h-2" />
                    </div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      가상 피팅 시작
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

          {/* 결과 섹션 (슬라이드 애니메이션) */}
          {showResults && (
            <Card
              className={`transition-all duration-700 ease-in-out transform order-2 ${
                showResults
                  ? "translate-x-0 opacity-100 md:translate-x-2"
                  : "translate-x-full opacity-0"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">결과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-6">
                  {/* 로딩 상태 표시 */}
                  {isProcessing && !generatedImage && (
                    <div className="space-y-3">
                      <h3 className="font-medium">
                        이미지 생성 중... {progress}%
                      </h3>
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-full max-w-xs">
                          <Progress value={progress} className="w-full h-3" />
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          AI가 가상 피팅 이미지를 생성하고 있습니다.
                          <br />
                          잠시만 기다려주세요...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 생성된 이미지 */}
                  {generatedImage && (
                    <div className="space-y-3">
                      <h3 className="font-medium">생성된 이미지</h3>
                      <div className="relative">
                        {/* Next.js Image 대신 일반 img 태그 사용 (외부 도메인 이슈 회피) */}
                        <img
                          src={generatedImage}
                          alt="생성된 이미지"
                          className=" mx-auto w-full max-w-sm h-auto"
                          style={{ maxHeight: "400px", objectFit: "contain" }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => window.open(generatedImage, "_blank")}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 비디오 생성 로딩 상태 */}
                  {isProEnabled &&
                    generatedImage &&
                    isProcessing &&
                    !generatedVideo && (
                      <div className="space-y-3">
                        <h3 className="font-medium">
                          비디오 생성 중... {progress}%
                        </h3>
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <div className="w-full max-w-xs">
                            <Progress value={progress} className="w-full h-3" />
                          </div>
                          <p className="text-sm text-gray-600 text-center">
                            AI가 비디오를 생성하고 있습니다...
                          </p>
                        </div>
                      </div>
                    )}

                  {/* 생성된 비디오 */}
                  {generatedVideo && (
                    <div className="space-y-3">
                      <h3 className="font-medium">생성된 비디오</h3>
                      <div className="relative">
                        <video
                          src={generatedVideo}
                          controls
                          loop
                          muted
                          autoPlay
                          className="w-full max-w-sm rounded-lg shadow-lg mx-auto"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => window.open(generatedVideo, "_blank")}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
