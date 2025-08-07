// src/app/policies/agreement/page.tsx
"use client";

import React from "react";

export default function AgreementPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4 text-sm leading-relaxed">
      <h1 className="text-2xl font-bold mb-8">이용약관</h1>

      <section>
        <h2 className="font-semibold mb-2">제1조 (목적)</h2>
        <p>
          이 약관은 ㈜메타뱅크(전자상거래 사업자, 이하 &quot;회사&quot;)가
          운영하는 <strong>보고핏(BOGOFIT)</strong> 사이버몰(이하
          &quot;몰&quot;)에서 제공하는 인터넷 관련 서비스(이하
          &quot;서비스&quot;)를 이용함에 있어 &quot;몰&quot;과 이용자의 권리,
          의무 및 책임사항을 규정함을 목적으로 합니다.
          <br />※ PC통신, 무선 등에서도 그 성질에 반하지 않는 한 이 약관을
          준용합니다.
        </p>
      </section>

      <section>
        <h2 className="font-semibold mt-6 mb-2">제2조 (정의)</h2>
        <ul className="list-disc pl-6">
          <li>
            “몰”: ㈜메타뱅크가 재화 또는 용역(이하 &quot;재화 등&quot;)을
            이용자에게 제공하기 위해 컴퓨터 등 정보통신설비를 이용해 재화 등을
            거래할 수 있도록 설정한 가상의 영업장
          </li>
          <li>
            “이용자”: “몰”에 접속하여 이 약관에 따라 “몰”이 제공하는 서비스를
            받는 회원 및 비회원
          </li>
          <li>
            “회원”: “몰”에 회원등록을 한 자로서, 계속적으로 “몰”이 제공하는
            서비스를 이용할 수 있는 자
          </li>
          <li>
            “비회원”: 회원에 가입하지 않고 “몰”이 제공하는 서비스를 이용하는 자
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-semibold mt-6 mb-2">
          제3조 (약관 등의 명시와 설명 및 개정)
        </h2>
        <ol className="list-decimal pl-6">
          <li>
            “몰”은 이 약관, 상호, 대표자, 주소, 연락처, 사업자등록번호,
            통신판매업 신고번호, 개인정보관리책임자 등을 “몰” 초기 화면에
            게시합니다. 단, 약관 내용은 연결화면으로 볼 수 있도록 할 수
            있습니다.
          </li>
          <li>
            중요내용(청약철회, 배송책임, 환불조건 등)은 별도 연결화면 또는
            팝업을 통해 이용자가 쉽게 확인할 수 있게 합니다.
          </li>
          <li>
            “몰”은 관련법을 위배하지 않는 범위에서 약관을 개정할 수 있습니다.
          </li>
          <li>
            약관을 개정할 경우, 적용일자 및 사유를 명시하여 현행약관과 함께
            적용일자 7일 전부터 공지하며, 불리한 변경 시 최소 30일 전
            공지합니다.
          </li>
          <li>
            개정약관은 적용일자 이후 체결된 계약에만 적용됩니다. 단, 이용자가
            적용을 원할 경우 예외적으로 적용할 수 있습니다.
          </li>
          <li>
            약관에 명시되지 않은 사항 및 해석은 관련법령과 상관례에 따릅니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="font-semibold mt-6 mb-2">
          제4조 (서비스의 제공 및 변경)
        </h2>
        <ol className="list-decimal pl-6">
          <li>
            “몰”이 제공하는 업무: 재화/용역 정보 제공 및 구매계약 체결, 배송,
            기타 “몰”이 정하는 업무
          </li>
          <li>
            재화/용역 품절, 사양 변경 등 시 변경내용/제공일자를 공지합니다.
          </li>
          <li>
            이미 계약된 서비스의 변경 시 이용자에게 즉시 통지하며, 손해가 발생한
            경우 배상합니다. 단, 고의/과실이 없는 경우는 예외입니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="font-semibold mt-6 mb-2">제5조~제24조</h2>
        <p>
          본 약관의 상세 내용은 전자상거래 표준 약관(공정거래위원회)과 관련
          법령에 따라 작성되었으며,
          <br />
          회원가입, 서비스 이용, 구매, 결제, 배송, 환불, 청약철회, 개인정보보호,
          분쟁해결 등은{" "}
          <strong>전자상거래 등에서의 소비자보호에 관한 법률</strong> 및 기타
          관련 법령을 준수합니다.
          <br />
          <br />
          보다 자세한 약관 내용이 필요할 경우, 공식 약관 샘플 또는 관련 전문
          변호사 자문을 통해 사이트 운영에 맞는 형태로 보완해 주세요.
        </p>
      </section>

      <section>
        <h2 className="font-semibold mt-6 mb-2">부칙(시행일)</h2>
        <p>본 약관은 2024년 6월 1일부터 시행합니다.</p>
      </section>
    </main>
  );
}
