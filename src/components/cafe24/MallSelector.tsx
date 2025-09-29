"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, ExternalLink } from "lucide-react";

interface MallSelectorProps {
  currentMallId?: string;
  onMallChange?: (mallId: string) => void;
}

export default function MallSelector({
  currentMallId,
  //   onMallChange,
}: MallSelectorProps) {
  const [newMallId, setNewMallId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMallSwitch = async () => {
    if (!newMallId.trim()) {
      setError("쇼핑몰 ID를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cafe24/switch-mall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mallId: newMallId.trim(),
          userId: "current_user", // 실제로는 인증된 사용자 ID 사용
        }),
      });

      const data = await response.json();

      if (data.success) {
        // OAuth 인증 페이지로 리디렉션
        window.location.href = data.data.authUrl;
      } else {
        setError(data.error || "쇼핑몰 전환에 실패했습니다.");
      }
    } catch (error) {
      console.error("쇼핑몰 전환 오류:", error);
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          쇼핑몰 전환
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 현재 쇼핑몰 */}
        {currentMallId && (
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">현재 쇼핑몰:</Label>
            <Badge variant="default">{currentMallId}</Badge>
          </div>
        )}

        {/* 새 쇼핑몰 입력 */}
        <div className="space-y-2">
          <Label htmlFor="newMallId">새 쇼핑몰 ID</Label>
          <Input
            id="newMallId"
            type="text"
            value={newMallId}
            onChange={(e) => setNewMallId(e.target.value)}
            placeholder="예: yourmall"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Cafe24 쇼핑몰 관리자 페이지 URL에서 확인할 수 있습니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* 전환 버튼 */}
        <Button
          onClick={handleMallSwitch}
          disabled={isLoading || !newMallId.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              전환 중...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              쇼핑몰 전환
            </>
          )}
        </Button>

        {/* 도움말 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>참고:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>새 쇼핑몰로 전환하면 OAuth 인증이 필요합니다.</li>
            <li>각 쇼핑몰마다 별도의 권한 설정이 필요합니다.</li>
            <li>기존 토큰은 새 쇼핑몰에서 사용할 수 없습니다.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
