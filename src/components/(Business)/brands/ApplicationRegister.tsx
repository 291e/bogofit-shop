"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {  CreateApplicationResponse, ApplicationFormData } from "@/types/application";
import { useAuth } from "@/providers/authProvider";
import { Building2, User, Mail, Phone, FileText } from "lucide-react";

interface ApplicationRegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  applicationStatus?: string; // "none", "rejected", "banned"
}

export default function ApplicationRegister({ isOpen, onClose, onSuccess, applicationStatus = "none" }: ApplicationRegisterProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    businessName: "",
    bizRegNo: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    docs: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.businessName) {
      setError("회사명을 입력해주세요");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""  }`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          bizRegNo: formData.bizRegNo,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          docs: formData.docs,
        }),
      });

      const data: CreateApplicationResponse = await response.json();

      if (data.success) {
        setError("");
        alert("사업자 신청이 완료되었습니다! 검토 후 결과를 알려드리겠습니다.");
        onSuccess();
      } else {
        setError(data.message || "신청 실패");
      }
    } catch (err) {
      setError("서버 연결 오류입니다. API를 다시 확인해주세요.");
      console.error("Application error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[35vw] max-h-[90vh] overflow-y-auto" 
        style={{ 
          width: '35vw', 
          maxWidth: '45vw',
          minWidth: '25vw'
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-600">
            <FileText className="h-6 w-6" />
            {applicationStatus === "rejected" ? "사업자 신청 재제출" : 
             applicationStatus === "banned" ? "계정 복구 신청" : "사업자 신청 (필수)"}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            {applicationStatus === "rejected" ? "이전 신청이 거부되었습니다. 정보를 수정하여 다시 신청해주세요." :
             applicationStatus === "banned" ? "계정이 정지되었습니다. 복구를 위해 사업자 정보를 제출해주세요." :
             "브랜드 대시보드에 접근하려면 사업자 신청이 필요합니다."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="businessName" className="text-base font-bold text-gray-700">
                회사명 *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  placeholder="회사명을 입력하세요"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="h-10 pl-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="bizRegNo" className="text-base font-bold text-gray-700">
                사업자등록번호
              </label>
              <Input
                id="bizRegNo"
                name="bizRegNo"
                type="text"
                placeholder="사업자등록번호를 입력하세요"
                value={formData.bizRegNo}
                onChange={(e) => setFormData(prev => ({ ...prev, bizRegNo: e.target.value }))}
                className="h-10 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="contactName" className="text-base font-bold text-gray-700">
                담당자명
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="contactName"
                  name="contactName"
                  type="text"
                  placeholder="담당자명을 입력하세요"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  className="h-10 pl-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="contactPhone" className="text-base font-bold text-gray-700">
                연락처
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="연락처를 입력하세요"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="h-10 pl-12 text-base"
                />
              </div>
            </div>
          </div>

            <div className="space-y-3">
              <label htmlFor="contactEmail" className="text-base font-bold text-gray-700">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="h-10 pl-12 text-base"
                />
              </div>
            </div>

          {/* Documents Upload Section */}
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">필수 서류</h3>
              <p className="text-base text-gray-600 mb-6">
                사업자 신청에 필요한 서류를 업로드해주세요.
              </p>
              
              <div className="space-y-4">
                {/* Business License */}
                <div className="space-y-3">
                  <label className="text-base font-bold text-gray-700">
                    사업자등록증 *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="파일명을 입력하세요"
                      value={formData.docs.find(doc => doc.type === "business_license")?.name || ""}
                      onChange={(e) => {
                        const newDocs = formData.docs.filter(doc => doc.type !== "business_license");
                        if (e.target.value) {
                          newDocs.push({
                            type: "business_license",
                            name: e.target.value,
                            url: "https://example.com/business-license.pdf" // Mock URL
                          });
                        }
                        setFormData(prev => ({ ...prev, docs: newDocs }));
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Mock file upload
                        const newDocs = formData.docs.filter(doc => doc.type !== "business_license");
                        newDocs.push({
                          type: "business_license",
                          name: "사업자등록증.pdf",
                          url: "https://example.com/business-license.pdf"
                        });
                        setFormData(prev => ({ ...prev, docs: newDocs }));
                      }}
                    >
                      업로드
                    </Button>
                  </div>
                </div>

                {/* Tax Code */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    세금계산서 *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="파일명을 입력하세요"
                      value={formData.docs.find(doc => doc.type === "tax_code")?.name || ""}
                      onChange={(e) => {
                        const newDocs = formData.docs.filter(doc => doc.type !== "tax_code");
                        if (e.target.value) {
                          newDocs.push({
                            type: "tax_code",
                            name: e.target.value,
                            url: "https://example.com/tax-code.pdf" // Mock URL
                          });
                        }
                        setFormData(prev => ({ ...prev, docs: newDocs }));
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Mock file upload
                        const newDocs = formData.docs.filter(doc => doc.type !== "tax_code");
                        newDocs.push({
                          type: "tax_code",
                          name: "세금계산서.pdf",
                          url: "https://example.com/tax-code.pdf"
                        });
                        setFormData(prev => ({ ...prev, docs: newDocs }));
                      }}
                    >
                      업로드
                    </Button>
                  </div>
                </div>

                {/* Additional Documents */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    기타 서류 (선택)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="파일명을 입력하세요"
                      value={formData.docs.find(doc => doc.type === "other")?.name || ""}
                      onChange={(e) => {
                        const newDocs = formData.docs.filter(doc => doc.type !== "other");
                        if (e.target.value) {
                          newDocs.push({
                            type: "other",
                            name: e.target.value,
                            url: "https://example.com/other-document.pdf" // Mock URL
                          });
                        }
                        setFormData(prev => ({ ...prev, docs: newDocs }));
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Mock file upload
                        const newDocs = formData.docs.filter(doc => doc.type !== "other");
                        newDocs.push({
                          type: "other",
                          name: "기타서류.pdf",
                          url: "https://example.com/other-document.pdf"
                        });
                        setFormData(prev => ({ ...prev, docs: newDocs }));
                      }}
                    >
                      업로드
                    </Button>
                  </div>
                </div>
              </div>

              {/* Display uploaded documents */}
              {formData.docs.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">업로드된 서류:</h4>
                  <div className="space-y-1">
                    {formData.docs.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{doc.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDocs = formData.docs.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, docs: newDocs }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          삭제
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-10 text-base"
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              disabled={loading}
            >
              {loading ? "신청 중..." : "사업자 신청"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
