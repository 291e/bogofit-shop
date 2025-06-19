"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Play,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import Image from "next/image";

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
  const [status, setStatus] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const connectionInfoRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clientId = "0d7d0263c7f94a4a90cf2dbbff3a45bf";

  // 이미지 URL을 File 객체로 변환하는 함수 (프록시 사용)
  const urlToFile = async (
    url: string,
    filename: string
  ): Promise<File | null> => {
    try {
      // 프록시를 통해 이미지 가져오기
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

  // 파일 업로드 핸들러
  const handleFileChange = (
    fieldName: keyof typeof files,
    file: File | null
  ) => {
    setFiles((prev) => ({ ...prev, [fieldName]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => ({
          ...prev,
          [fieldName]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // 워크플로우 직접 실행
  const runWorkflowDirect = async (formData: FormData) => {
    try {
      setStatus("이미지 생성 중...");

      const workflowResponse = await fetch(
        "/api/virtual-fitting/run_workflow",
        {
          method: "POST",
          body: formData,
        }
      );

      let workflowResult;
      const responseText = await workflowResponse.text();

      try {
        workflowResult = JSON.parse(responseText);
      } catch {
        // JSON 파싱 실패시 원본 텍스트 사용
        console.error("서버 응답 파싱 실패:", responseText);

        // 에러 메시지 개선
        if (
          workflowResponse.status === 500 &&
          (responseText.includes("Internal Server Error") ||
            responseText.includes("Internal S"))
        ) {
          setStatus("사람 이미지는 최소한 상반신을 포함하여 올려주세요!");
        } else {
          setStatus(
            `서버 오류 (${workflowResponse.status}): ${responseText.substring(
              0,
              100
            )}...`
          );
        }
        return;
      }

      if (workflowResponse.ok && workflowResult.image_url) {
        setStatus("이미지 생성 완료!");
        setGeneratedImage(workflowResult.image_url);

        if (isProEnabled) {
          setStatus("비디오 생성 중...");
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
            setStatus(
              `비디오 생성 서버 오류: ${proResponseText.substring(0, 100)}...`
            );
            return;
          }

          if (proResponse.ok && proResult.video_url) {
            setStatus("비디오 생성 완료!");
            setGeneratedVideo(proResult.video_url);
          } else {
            setStatus(
              "비디오 생성 실패: " + (proResult.error || "알 수 없는 오류")
            );
          }
        }
      } else {
        // 에러 메시지 개선
        let errorMessage = "이미지 생성 실패: ";

        if (
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
      setStatus("네트워크 오류: " + (error as Error).message);
    } finally {
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
    setGeneratedImage("");
    setGeneratedVideo("");
    setStatus("연결 중...");

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

      setStatus("워크플로우 시작 중...");
      await runWorkflowDirect(formData);
    } catch (error) {
      setStatus("연결 오류: " + (error as Error).message);
      setIsProcessing(false);
    }
  };

  const handleStartWorkflow = async () => {
    setShowResults(true);
    await runWorkflow();
  };

  const resetComponent = () => {
    setShowResults(false);
    setGeneratedImage("");
    setGeneratedVideo("");
    setStatus("");
    setIsProcessing(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <span className="text-red-500">*</span> 사람 이미지
                      <span className="block text-xs text-gray-500 font-normal mt-1">
                        최소한 상반신이 포함된 사진을 업로드해주세요
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                          handleFileChange(
                            "human_file",
                            e.target.files?.[0] || null
                          )
                        }
                        className="hidden"
                        id="human_file"
                      />
                      <label htmlFor="human_file" className="cursor-pointer">
                        {previews.human_file ? (
                          <Image
                            src={previews.human_file}
                            alt="사람 이미지"
                            width={100}
                            height={100}
                            className="mx-auto rounded"
                          />
                        ) : (
                          <div className="py-4">
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              클릭하여 업로드
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <span className="text-red-500">*</span> 상의 이미지
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                          handleFileChange(
                            "garment_file",
                            e.target.files?.[0] || null
                          )
                        }
                        className="hidden"
                        id="garment_file"
                      />
                      <label htmlFor="garment_file" className="cursor-pointer">
                        {previews.garment_file ? (
                          <Image
                            src={previews.garment_file}
                            alt="상의 이미지"
                            width={100}
                            height={100}
                            className="mx-auto rounded"
                          />
                        ) : currentImage &&
                          (productCategory === "상의" ||
                            productCategory === "아우터" ||
                            productCategory === "원피스") ? (
                          <div>
                            <Image
                              src={currentImage}
                              alt={productTitle || "상품"}
                              width={100}
                              height={100}
                              className="mx-auto rounded mb-2"
                            />
                            <p className="text-xs text-green-600 font-medium">
                              자동 업로드됨
                            </p>
                          </div>
                        ) : (
                          <div className="py-4">
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              클릭하여 업로드
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* 선택 파일들 */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      하의 이미지 (선택)
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                          handleFileChange(
                            "lower_file",
                            e.target.files?.[0] || null
                          )
                        }
                        className="hidden"
                        id="lower_file"
                      />
                      <label htmlFor="lower_file" className="cursor-pointer">
                        {previews.lower_file ? (
                          <Image
                            src={previews.lower_file}
                            alt="하의 이미지"
                            width={100}
                            height={100}
                            className="mx-auto rounded"
                          />
                        ) : currentImage && productCategory === "하의" ? (
                          <div>
                            <Image
                              src={currentImage}
                              alt={productTitle || "상품"}
                              width={100}
                              height={100}
                              className="mx-auto rounded mb-2"
                            />
                            <p className="text-xs text-green-600 font-medium">
                              자동 업로드됨
                            </p>
                          </div>
                        ) : (
                          <div className="py-4">
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">선택사항</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      배경 이미지 (선택)
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                          handleFileChange(
                            "background_file",
                            e.target.files?.[0] || null
                          )
                        }
                        className="hidden"
                        id="background_file"
                      />
                      <label
                        htmlFor="background_file"
                        className="cursor-pointer"
                      >
                        {previews.background_file ? (
                          <Image
                            src={previews.background_file}
                            alt="배경 이미지"
                            width={100}
                            height={100}
                            className="mx-auto rounded"
                          />
                        ) : (
                          <div className="py-4">
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">선택사항</p>
                          </div>
                        )}
                      </label>
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
                    AI 비디오 생성 활성화
                    <Badge variant="outline" className="ml-2 text-xs">
                      PRO
                    </Badge>
                  </label>
                </div>

                <Button
                  onClick={handleStartWorkflow}
                  disabled={
                    isProcessing || !files.human_file || !files.garment_file
                  }
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      처리 중...
                    </>
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
                      <h3 className="font-medium">이미지 생성 중...</h3>
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
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
                        <h3 className="font-medium">비디오 생성 중...</h3>
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
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
