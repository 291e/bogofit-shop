import { Text, Heading, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { BaseEmail } from "./BaseEmail";

export interface ExchangeRefundEmailProps {
  orderId: string;
  productTitle: string;
  amount: number;
  orderDate: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  requestType: "exchange" | "refund";
  reason: string;
  description: string;
  appUrl: string;
}

export const ExchangeRefundEmail = ({
  orderId,
  productTitle,
  amount,
  orderDate,
  applicantName,
  applicantPhone,
  applicantEmail,
  requestType,
  reason,
  description,
}: ExchangeRefundEmailProps) => {
  const requestTypeText = requestType === "exchange" ? "교환" : "반품";

  return (
    <BaseEmail
      title={`${requestTypeText} 신청서`}
      previewText={`주문번호 ${orderId}에 대한 ${requestTypeText} 신청이 접수되었습니다.`}
    >
      {/* 메인 제목 */}
      <Section style={headerSectionStyle}>
        <Heading style={mainTitleStyle}>
          {requestType === "exchange" ? "🔄" : "📦"} {requestTypeText} 신청서
        </Heading>
        <Text style={subtitleStyle}>
          고객님의 {requestTypeText} 신청이 접수되었습니다
        </Text>
      </Section>

      {/* 주문 정보 */}
      <Section style={sectionStyle}>
        <Heading style={methodTitleStyle}>주문 정보</Heading>
        <Section style={tableSectionStyle}>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>주문번호</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={tableValueTextStyle}>{orderId}</Text>
            </Column>
          </Row>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>상품명</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={tableValueTextStyle}>{productTitle}</Text>
            </Column>
          </Row>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>결제금액</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={tableValueTextStyle}>
                {amount.toLocaleString()}원
              </Text>
            </Column>
          </Row>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>주문일</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={tableValueTextStyle}>{orderDate}</Text>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* 신청자 정보 */}
      <Section style={sectionStyle}>
        <Heading style={methodTitleStyle}>신청자 정보</Heading>
        <Section style={tableSectionStyle}>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>이름</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={tableValueTextStyle}>{applicantName}</Text>
            </Column>
          </Row>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>연락처</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={tableValueTextStyle}>{applicantPhone}</Text>
            </Column>
          </Row>
          {applicantEmail && (
            <Row style={tableRowStyle}>
              <Column style={tableLabelStyle}>
                <Text style={tableLabelTextStyle}>이메일</Text>
              </Column>
              <Column style={tableValueStyle}>
                <Text style={tableValueTextStyle}>{applicantEmail}</Text>
              </Column>
            </Row>
          )}
        </Section>
      </Section>

      {/* 신청 내용 */}
      <Section style={sectionStyle}>
        <Heading style={methodTitleStyle}>신청 내용</Heading>
        <Section style={tableSectionStyle}>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>신청 유형</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={tableValueTextStyle}>{requestTypeText}</Text>
            </Column>
          </Row>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>신청 사유</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={tableValueTextStyle}>{reason}</Text>
            </Column>
          </Row>
          {description && (
            <Row style={tableRowStyle}>
              <Column style={tableLabelStyle}>
                <Text style={tableLabelTextStyle}>상세 설명</Text>
              </Column>
              <Column style={tableValueStyle}>
                <Text style={descriptionTextStyle}>{description}</Text>
              </Column>
            </Row>
          )}
        </Section>
      </Section>

      {/* 처리 안내 */}
      <Section style={processSectionStyle}>
        <Row>
          <Column>
            <Text style={processTitleStyle}>📋 처리 안내</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={processTextStyle}>
              • {requestTypeText} 신청이 정상적으로 접수되었습니다
              <br />
              • 영업일 기준 1-2일 내 담당자가 연락드릴 예정입니다
              <br />• 상품 회수 및 {requestTypeText} 처리까지는 3-5일 소요됩니다
              <br />• 추가 문의사항은 고객센터로 연락해 주세요
            </Text>
          </Column>
        </Row>
      </Section>

      {/* 고객센터 정보 */}
      <Section style={sectionStyle}>
        <Text style={supportTextStyle}>
          <strong>고객센터 정보</strong>
          <br />
          이메일: bogofit@naver.com
          <br />
          전화: 042-385-1008 (평일 10:00-18:00)
        </Text>
      </Section>

      {/* 자동 생성 안내 */}
      <Section style={footerSectionStyle}>
        <Text style={footerTextStyle}>
          이 메일은 BOGOFIT 웹사이트에서 자동으로 생성되었습니다.
        </Text>
      </Section>
    </BaseEmail>
  );
};

// 스타일 정의
const headerSectionStyle = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const mainTitleStyle = {
  color: "#2563eb",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
};

const subtitleStyle = {
  color: "#6b7280",
  fontSize: "16px",
  margin: "0",
  textAlign: "center" as const,
};

const sectionStyle = {
  marginBottom: "24px",
};

const methodTitleStyle = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const tableSectionStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  overflow: "hidden",
};

const tableRowStyle = {
  borderBottom: "1px solid #e5e7eb",
};

const tableLabelStyle = {
  backgroundColor: "#f9fafb",
  padding: "16px",
  width: "30%",
};

const tableValueStyle = {
  backgroundColor: "#ffffff",
  padding: "16px",
  width: "70%",
};

const tableLabelTextStyle = {
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};

const tableValueTextStyle = {
  color: "#1f2937",
  fontSize: "16px",
  margin: "0",
};

const descriptionTextStyle = {
  color: "#1f2937",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const processSectionStyle = {
  backgroundColor: "#dbeafe",
  border: "1px solid #3b82f6",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const processTitleStyle = {
  color: "#1e40af",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const processTextStyle = {
  color: "#1e40af",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const supportTextStyle = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0",
};

const footerSectionStyle = {
  marginTop: "32px",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "16px",
};

const footerTextStyle = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};
