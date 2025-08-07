"use client";

import React from "react";

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4 text-sm leading-relaxed">
      <h1 className="text-2xl font-bold mb-6">개인정보 처리방침</h1>

      <p>
        <strong>보고핏(BOGOFIT)</strong> (이하 &quot;회사&quot;)는 고객님의
        개인정보를 중요시하며, &quot;정보통신망 이용촉진 및 정보보호&quot;에
        관한 법률을 준수하고 있습니다. 회사는 개인정보처리방침을 통하여
        고객님께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며,
        개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
      </p>

      <h2 className="font-semibold mt-8 mb-2">
        ■ 수집하는 개인정보 항목 및 수집방법
      </h2>
      <p>
        <strong>가. 수집하는 개인정보의 항목</strong>
        <br />
        회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를
        수집하고 있습니다.
        <br />
        - 회원가입시: 이름, 생년월일, 성별, 로그인ID, 비밀번호, 자택 전화번호,
        휴대전화번호, 이메일, 14세 미만 가입자의 경우 법정대리인 정보
        <br />
        - 서비스 신청시: 주소, 결제 정보
        <br />- 서비스 이용 과정/사업 처리 과정에서 서비스이용기록, 접속로그,
        쿠키, 접속 IP, 결제 기록, 불량이용 기록이 생성되어 수집될 수 있습니다.
      </p>
      <p>
        <strong>나. 수집방법</strong>
        <br />
        홈페이지, 서면양식, 게시판, 이메일, 이벤트 응모, 배송요청, 전화, 팩스,
        생성 정보 수집 툴을 통한 수집
      </p>

      <h2 className="font-semibold mt-8 mb-2">■ 개인정보의 수집 및 이용목적</h2>
      <ul className="list-disc pl-6 mb-3">
        <li>
          서비스 제공에 관한 계약 이행 및 요금정산: 콘텐츠 제공, 구매 및 결제,
          물품배송, 금융거래 본인 인증 등
        </li>
        <li>
          회원 관리: 본인확인, 불량회원 방지, 연령확인, 법정대리인 동의 확인,
          민원처리, 고지사항 전달 등
        </li>
        <li>
          마케팅/광고: 이벤트 정보전달, 접속 빈도 파악, 서비스 이용 통계 등
        </li>
      </ul>

      <h2 className="font-semibold mt-8 mb-2">■ 개인정보의 보유 및 이용기간</h2>
      <p>
        원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체
        없이 파기합니다. 단, 관련 법령에 따라 아래와 같이 보존할 수 있습니다.
        <br />
        <br />
        <strong>가. 회사 내부방침</strong>
        <br />
        회원 탈퇴 후에도 부정이용 방지, 분쟁해결, 수사기관 협조를 위해
        해지일로부터 일정 기간(OO년) 보유 가능
        <br />
        <br />
        <strong>나. 법령에 의한 보유</strong>
        <br />
        - 계약/청약철회 기록: 5년 (전자상거래법)
        <br />
        - 대금결제/재화공급 기록: 5년 (전자상거래법)
        <br />
        - 소비자불만/분쟁처리 기록: 3년 (전자상거래법)
        <br />- 로그기록: 3개월 (통신비밀보호법)
      </p>

      <h2 className="font-semibold mt-8 mb-2">■ 개인정보의 파기절차 및 방법</h2>
      <p>
        개인정보는 목적 달성 후 별도 DB로 옮겨져 관련 법령에 따라 일정 기간 저장
        후 파기합니다.
        <br />
        - 전자적 파일: 복구 불가한 기술적 방법으로 삭제
        <br />- 서면: 분쇄/소각 등
      </p>

      <h2 className="font-semibold mt-8 mb-2">■ 개인정보 제공</h2>
      <p>
        원칙적으로 외부에 제공하지 않으며, 아래 경우에만 예외적으로 제공됩니다.
        <br />
        - 사전 동의 시<br />- 법령/수사기관 요청 시
      </p>

      <h2 className="font-semibold mt-8 mb-2">■ 개인정보 위탁</h2>
      <ul className="list-disc pl-6 mb-3">
        <li>위탁 대상자: [택배사 이름] / 위탁 내용: [택배사 위탁 내용]</li>
        <li>위탁 대상자: [PG사 이름] / 위탁 내용: [PG사 위탁 내용]</li>
      </ul>

      <h2 className="font-semibold mt-8 mb-2">
        ■ 이용자 및 법정대리인의 권리와 행사방법
      </h2>
      <ul className="list-disc pl-6 mb-3">
        <li>언제든지 개인정보 조회/수정/탈퇴 가능</li>
        <li>오류 정정 요청 시 정정 완료 전까지 개인정보 이용/제공 중지</li>
        <li>해지/삭제된 정보는 관련 법령에 따라 처리 및 열람 불가</li>
      </ul>

      <h2 className="font-semibold mt-8 mb-2">
        ■ 개인정보 자동수집 장치의 설치/운영 및 거부
      </h2>
      <ul className="list-disc pl-6 mb-3">
        <li>쿠키 등 자동수집장치 운영 (접속 빈도, 맞춤 서비스 제공 등 목적)</li>
        <li>쿠키 거부 방법: 브라우저 옵션 설정 참조</li>
        <li>쿠키 거부 시 일부 서비스 이용 제한 가능</li>
      </ul>

      <h2 className="font-semibold mt-8 mb-2">■ 개인정보 민원서비스</h2>
      <p>
        <strong>개인정보관리담당자/책임자</strong>
        <br />
        성명: 소요환
        <br />
        소속: 보고핏(BOGOFIT)
        <br />
        전화번호: 042-385-1008
        <br />
        이메일: metabank@naver.com
        <br />
        <br />
        개인정보보호 관련 문의 및 신고는 위 연락처 및 아래 기관에서 가능합니다.
        <br />
        - 개인정보침해신고센터: privacy.kisa.or.kr / 국번 없이 118
        <br />
        - 대검찰청 사이버수사단: www.spo.go.kr / 02-3480-2000
        <br />- 경찰청 사이버안전국: www.ctrc.go.kr / 국번 없이 182
      </p>
    </main>
  );
}
