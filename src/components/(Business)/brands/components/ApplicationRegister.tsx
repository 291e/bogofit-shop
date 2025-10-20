"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {  CreateApplicationResponse, ApplicationFormData, ApiApplicationResponse } from "@/types/application";
import { useAuth } from "@/providers/authProvider";
import { Building2, User, Mail, Phone, FileText } from "lucide-react";
import { ImageUploader } from "@/components/ui/imageUploader";
// import { toast } from "sonner"; // Unused - toast handled by mutation hook

interface ApplicationRegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: CreateApplicationResponse) => void; // Pass response data
  applicationStatus?: string; // "none", "rejected", "banned"
  existingApplication?: ApiApplicationResponse | null; // Existing application for editing
}

export default function ApplicationRegister({ 
  isOpen, 
  onClose, 
  onSuccess, 
  applicationStatus = "none",
  existingApplication = null 
}: ApplicationRegisterProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<ApplicationFormData>({
    businessName: "",
    bizRegNo: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    docs: [],
  });
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState<string | null>(null);
  const [taxCodeUrl, setTaxCodeUrl] = useState<string | null>(null);
  const [otherDocsUrls, setOtherDocsUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form with existing application data
  useEffect(() => {
    if (existingApplication?.application) {
      const app = existingApplication.application;
      setFormData({
        businessName: app.businessName || "",
        bizRegNo: app.bizRegNo || "",
        contactName: app.contactName || "",
        contactPhone: app.contactPhone || "",
        contactEmail: app.contactEmail || "",
        docs: [],
      });

      // Parse and populate document URLs
      try {
        const docs = JSON.parse(app.docs || "[]");
        if (Array.isArray(docs)) {
          const businessLicense = docs.find(d => d.type === "business_license");
          const taxCode = docs.find(d => d.type === "tax_code");
          const others = docs.filter(d => d.type === "other");

          if (businessLicense) setBusinessLicenseUrl(businessLicense.url);
          if (taxCode) setTaxCodeUrl(taxCode.url);
          if (others.length > 0) setOtherDocsUrls(others.map(d => d.url));
        }
      } catch (err) {
        console.error("Error parsing docs:", err);
      }
    }
  }, [existingApplication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.businessName) {
      setError("회사명을 입력해주세요");
      setLoading(false);
      return;
    }

    if (!businessLicenseUrl) {
      setError("사업자등록증을 업로드해주세요");
      setLoading(false);
      return;
    }

    if (!taxCodeUrl) {
      setError("세금계산서를 업로드해주세요");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("로그인이 필요합니다");
      setLoading(false);
      return;
    }

    // Build docs array from uploaded images
    const docs = [];
    if (businessLicenseUrl) {
      docs.push({
        type: "business_license",
        name: "사업자등록증",
        url: businessLicenseUrl
      });
    }
    if (taxCodeUrl) {
      docs.push({
        type: "tax_code",
        name: "세금계산서",
        url: taxCodeUrl
      });
    }
    otherDocsUrls.forEach((url, index) => {
      docs.push({
        type: "other",
        name: `기타서류_${index + 1}`,
        url
      });
    });

    try {
      const isEditing = !!existingApplication;
      const response = await fetch("/api/application", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          bizRegNo: formData.bizRegNo,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          docs: docs,
        }),
      });

      const data: CreateApplicationResponse = await response.json();

      if (data.success) {
        setError("");
        // Toast is handled by the mutation hook
        onSuccess(data); // Pass response data
      } else {
        setError(data.message || (isEditing ? "수정 실패" : "신청 실패"));
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
            {existingApplication ? "사업자 신청 수정" :
             applicationStatus === "rejected" ? "사업자 신청 재제출" : 
             applicationStatus === "banned" ? "계정 복구 신청" : "사업자 신청 (필수)"}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            {existingApplication ? "거부 사유를 확인하고 정보를 수정한 후 다시 제출해주세요." :
             applicationStatus === "rejected" ? "이전 신청이 거부되었습니다. 정보를 수정하여 다시 신청해주세요." :
             applicationStatus === "banned" ? "계정이 정지되었습니다. 복구를 위해 사업자 정보를 제출해주세요." :
             "브랜드 대시보드에 접근하려면 사업자 신청이 필요합니다."}
          </p>
          {existingApplication?.application?.noteAdmin && (
            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm font-semibold text-red-800 mb-1">거부 사유:</p>
              <p className="text-sm text-red-700">{existingApplication.application.noteAdmin}</p>
            </div>
          )}
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
                사업자 신청에 필요한 서류 이미지를 업로드해주세요. (JPG, PNG, WebP, GIF)
              </p>
              
              <div className="space-y-6">
                {/* Business License */}
                <div className="space-y-3">
                  <label className="text-base font-bold text-gray-700">
                    사업자등록증 *
                  </label>
                  <ImageUploader
                    value={businessLicenseUrl || undefined}
                    onChange={(url) => setBusinessLicenseUrl(url as string | null)}
                    single={true}
                    folder="brands"
                    height="180px"
                    previewSize="md"
                    disabled={loading}
                    onError={(err) => setError(err)}
                  />
                </div>

                {/* Tax Code */}
                <div className="space-y-3">
                  <label className="text-base font-bold text-gray-700">
                    세금계산서 *
                  </label>
                  <ImageUploader
                    value={taxCodeUrl || undefined}
                    onChange={(url) => setTaxCodeUrl(url as string | null)}
                    single={true}
                    folder="brands"
                    height="180px"
                    previewSize="md"
                    disabled={loading}
                    onError={(err) => setError(err)}
                  />
                </div>

                {/* Additional Documents */}
                <div className="space-y-3">
                  <label className="text-base font-bold text-gray-700">
                    기타 서류 (선택)
                  </label>
                  <ImageUploader
                    value={otherDocsUrls}
                    onChange={(urls) => setOtherDocsUrls((urls as string[]) || [])}
                    single={false}
                    maxFiles={3}
                    folder="brands"
                    height="180px"
                    previewSize="sm"
                    disabled={loading}
                    onError={(err) => setError(err)}
                  />
                </div>
              </div>
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
              {loading 
                ? (existingApplication ? "수정 중..." : "신청 중...") 
                : (existingApplication ? "수정 제출" : "사업자 신청")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
