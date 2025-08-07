"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface TermsAgreement {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
}

interface TermsAgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: (agreements: TermsAgreement) => void;
  initialAgreements?: TermsAgreement;
}

export function TermsAgreementModal({
  open,
  onOpenChange,
  onAgree,
  initialAgreements = { terms: false, privacy: false, marketing: false },
}: TermsAgreementModalProps) {
  const [agreements, setAgreements] =
    useState<TermsAgreement>(initialAgreements);

  const handleAgreementChange = (
    key: keyof TermsAgreement,
    checked: boolean
  ) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSelectAll = (checked: boolean) => {
    setAgreements({
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const handleConfirm = () => {
    if (!agreements.terms || !agreements.privacy) {
      alert("필수 약관에 동의해주세요.");
      return;
    }
    onAgree(agreements);
    onOpenChange(false);
  };

  const isAllRequired = agreements.terms && agreements.privacy;
  const isAllSelected =
    agreements.terms && agreements.privacy && agreements.marketing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>약관 동의</DialogTitle>
          <DialogDescription>
            BogoFit Shop 회원가입을 위해 아래 약관에 동의해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 전체 동의 */}
          <div className="flex items-center space-x-2 p-4 border rounded-lg bg-gray-50">
            <Checkbox
              id="all"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="all"
              className="text-base font-semibold cursor-pointer"
            >
              전체 동의하기
            </label>
          </div>

          <Separator />

          {/* 필수 약관들 */}
          <div className="space-y-4">
            {/* 이용약관 동의 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreements.terms}
                    onCheckedChange={(checked) =>
                      handleAgreementChange("terms", checked as boolean)
                    }
                  />
                  <label htmlFor="terms" className="font-medium cursor-pointer">
                    이용약관 동의 <span className="text-red-500">(필수)</span>
                  </label>
                </div>
              </div>
              <ScrollArea className="h-32 w-full border rounded p-3 text-sm text-gray-600">
                <div className="space-y-2">
                  <h4 className="font-semibold">제1조 (목적)</h4>
                  <p>
                    이 약관은 BogoFit Shop에서 제공하는 인터넷 관련 서비스(이하
                    &quot;서비스&quot;라 한다)를 이용함에 있어 사이버 몰과
                    이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
                  </p>

                  <h4 className="font-semibold">제2조 (정의)</h4>
                  <p>
                    &quot;BogoFit Shop&quot;란 BogoFit 회사가 재화 또는
                    용역(이하 &quot;재화 등&quot;이라함)을 이용자에게 제공하기
                    위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수
                    있도록 설정한 가상의 영업장을 말하며, 아울러 사이버몰을
                    운영하는 사업자의 의미로도 사용합니다.
                  </p>

                  <h4 className="font-semibold">
                    제3조 (약관의 명시와 설명 및 개정)
                  </h4>
                  <p>
                    BogoFit Shop은 이 약관의 내용과 상호 및 대표자 성명, 영업소
                    소재지 주소, 전화번호, 통신판매업 신고번호 등을 이용자가
                    쉽게 알 수 있도록 BogoFit Shop의 초기 서비스화면에
                    게시합니다.
                  </p>
                </div>
              </ScrollArea>
            </div>

            {/* 개인정보처리방침 동의 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={agreements.privacy}
                    onCheckedChange={(checked) =>
                      handleAgreementChange("privacy", checked as boolean)
                    }
                  />
                  <label
                    htmlFor="privacy"
                    className="font-medium cursor-pointer"
                  >
                    개인정보처리방침 동의{" "}
                    <span className="text-red-500">(필수)</span>
                  </label>
                </div>
              </div>
              <ScrollArea className="h-32 w-full border rounded p-3 text-sm text-gray-600">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. 개인정보 수집·이용 목적</h4>
                  <p>
                    - 회원 가입 의사의 확인, 회원제 서비스 제공에 따른 본인
                    식별·인증
                    <br />
                    - 고객 문의 처리, 불만처리 등을 위한 원활한 의사소통 경로의
                    확보
                    <br />- 상품의 배송, 서비스 제공
                  </p>

                  <h4 className="font-semibold">2. 수집하는 개인정보 항목</h4>
                  <p>
                    - 필수항목: 이름, 아이디, 비밀번호, 이메일
                    <br />- 선택항목: 휴대전화번호, 주소, 생년월일, 성별
                  </p>

                  <h4 className="font-semibold">3. 개인정보의 보유·이용기간</h4>
                  <p>
                    이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
                    다만, 아래의 경우에는 예외로 합니다.
                  </p>
                </div>
              </ScrollArea>
            </div>

            {/* 마케팅 정보 수신 동의 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={agreements.marketing}
                    onCheckedChange={(checked) =>
                      handleAgreementChange("marketing", checked as boolean)
                    }
                  />
                  <label
                    htmlFor="marketing"
                    className="font-medium cursor-pointer"
                  >
                    마케팅 정보 수신 동의{" "}
                    <span className="text-gray-500">(선택)</span>
                  </label>
                </div>
              </div>
              <ScrollArea className="h-24 w-full border rounded p-3 text-sm text-gray-600">
                <div className="space-y-2">
                  <h4 className="font-semibold">마케팅 정보 수신 동의</h4>
                  <p>
                    BogoFit Shop의 신상품 소식, 이벤트 정보, 할인 혜택 등의
                    마케팅 정보를 이메일 및 SMS로 받아보실 수 있습니다. 동의하지
                    않으셔도 서비스 이용에는 제한이 없으며, 언제든지 수신을
                    거부하실 수 있습니다.
                  </p>
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isAllRequired}
              className={`flex-1 ${
                isAllRequired
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              동의하고 계속하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
