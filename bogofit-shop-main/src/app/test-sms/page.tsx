"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TestSmsPage() {
  const [formData, setFormData] = useState({
    sender: "01091460120", // 기본값 (실제 등록된 발신번호로 변경 필요)
    receiver: "01094782790", // 기본값 (테스트할 수신번호로 변경)
    msg: "안녕하세요! ALIGO SMS API 테스트 메시지입니다.",
    testmodeYn: "Y", // 테스트 모드
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: {
      result_code?: number;
      message?: string;
      msg_id?: number;
      success_cnt?: number;
      error_cnt?: number;
      msg_type?: string;
      SMS_CNT?: number;
      LMS_CNT?: number;
      MMS_CNT?: number;
    };
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: "요청 중 오류가 발생했습니다: " + error,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const checkRemain = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sms/remain");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: "잔여 건수 조회 실패: " + error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>📱 ALIGO SMS API 테스트</CardTitle>
          <CardDescription>
            SMS 발송 기능을 테스트해보세요. 테스트 모드(Y)로 설정되어 실제
            발송되지 않습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 잔여 건수 조회 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={checkRemain}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "조회 중..." : "📊 잔여 건수 조회"}
            </Button>
          </div>

          {/* SMS 발송 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sender">발신번호</Label>
                <Input
                  id="sender"
                  name="sender"
                  value={formData.sender}
                  onChange={handleChange}
                  placeholder="025114560"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  ALIGO에 등록된 발신번호만 사용 가능
                </p>
              </div>

              <div>
                <Label htmlFor="receiver">수신번호</Label>
                <Input
                  id="receiver"
                  name="receiver"
                  value={formData.receiver}
                  onChange={handleChange}
                  placeholder="01012345678"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  여러 번호는 쉼표로 구분
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="msg">메시지 내용</Label>
              <Textarea
                id="msg"
                name="msg"
                value={formData.msg}
                onChange={handleChange}
                placeholder="메시지를 입력하세요..."
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                현재 길이: {formData.msg.length}자 / 최대 2000자
              </p>
            </div>

            <Alert>
              <AlertDescription>
                🧪 <strong>테스트 모드</strong>: 실제 문자는 발송되지 않고 API
                테스트만 진행됩니다.
              </AlertDescription>
            </Alert>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "전송 중..." : "📨 테스트 문자 발송"}
            </Button>
          </form>

          {/* 결과 표시 */}
          {result && (
            <Card
              className={result.success ? "border-green-200" : "border-red-200"}
            >
              <CardHeader>
                <CardTitle
                  className={result.success ? "text-green-700" : "text-red-700"}
                >
                  {result.success ? "✅ 성공" : "❌ 실패"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>

                {result.success && result.data && (
                  <div className="mt-4 space-y-4">
                    {/* SMS 발송 결과 */}
                    {result.data.msg_id && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-green-700">
                          📨 발송 결과
                        </h4>
                        <p>
                          <strong>메시지 ID:</strong> {result.data.msg_id}
                        </p>
                        <p>
                          <strong>성공 건수:</strong>{" "}
                          {result.data.success_cnt || 0}건
                        </p>
                        <p>
                          <strong>실패 건수:</strong>{" "}
                          {result.data.error_cnt || 0}건
                        </p>
                        <p>
                          <strong>메시지 타입:</strong>{" "}
                          {result.data.msg_type || "-"}
                        </p>
                      </div>
                    )}

                    {/* 잔여 건수 조회 결과 */}
                    {(result.data.SMS_CNT !== undefined ||
                      result.data.LMS_CNT !== undefined ||
                      result.data.MMS_CNT !== undefined) && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-3">
                          📊 잔여 포인트
                        </h4>
                        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">SMS (단문)</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {result.data.SMS_CNT ?? 0}건
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">LMS (장문)</p>
                            <p className="text-2xl font-bold text-green-600">
                              {result.data.LMS_CNT ?? 0}건
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">
                              MMS (그림문자)
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                              {result.data.MMS_CNT ?? 0}건
                            </p>
                          </div>
                        </div>
                        {result.data.SMS_CNT === 0 &&
                          result.data.LMS_CNT === 0 &&
                          result.data.MMS_CNT === 0 && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-yellow-800 text-sm">
                                ⚠️ <strong>포인트 부족:</strong> ALIGO
                                사이트에서 포인트를 충전해주세요.
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
