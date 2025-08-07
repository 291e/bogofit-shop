import {
  Text,
  Heading,
  Button,
  Section,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";
import { BaseEmail } from "./BaseEmail";

export interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
  verificationCode: string;
  appUrl: string;
}

export const VerificationEmail = ({
  userName,
  verificationUrl,
  verificationCode,
}: VerificationEmailProps) => {
  return (
    <BaseEmail
      title="이메일 인증"
      previewText={`${userName}님, BogoFit Shop 이메일 인증을 완료해 주세요.`}
    >
      {/* 메인 제목 */}
      <Section style={headerSectionStyle}>
        <Heading style={mainTitleStyle}>이메일 인증이 필요합니다</Heading>
        <Text style={subtitleStyle}>
          계정을 활성화하기 위한 마지막 단계입니다
        </Text>
      </Section>

      {/* 인사말 */}
      <Section style={sectionStyle}>
        <Heading style={greetingStyle}>안녕하세요, {userName}님!</Heading>
        <Text style={textStyle}>
          BogoFit Shop에 가입해 주셔서 감사합니다. 계정을 활성화하기 위해 이메일
          인증을 완료해 주세요.
        </Text>
      </Section>

      {/* 인증 버튼 */}
      <Section style={sectionStyle}>
        <Heading style={methodTitleStyle}>방법 1: 버튼으로 인증</Heading>
        <Text style={textStyle}>
          아래 버튼을 클릭하여 즉시 이메일 인증을 완료하세요.
        </Text>
        <Section style={buttonSectionStyle}>
          <Button href={verificationUrl} style={buttonStyle}>
            ✨ 이메일 인증하기
          </Button>
        </Section>
      </Section>

      {/* 인증 코드 */}
      <Section style={sectionStyle}>
        <Heading style={methodTitleStyle}>방법 2: 인증 코드 입력</Heading>
        <Text style={textStyle}>
          위 버튼이 작동하지 않는 경우, 아래 인증 코드를 직접 입력해 주세요:
        </Text>
        <Section style={codeSectionStyle}>
          <Text style={codeStyle}>{verificationCode}</Text>
        </Section>
      </Section>

      {/* 보안 안내 */}
      <Section style={warningSectionStyle}>
        <Row>
          <Column>
            <Text style={warningTitleStyle}>⚠️ 보안 안내</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={warningTextStyle}>
              • 인증 코드는 24시간 후 만료됩니다
              <br />
              • 이 이메일을 요청하지 않았다면 무시하세요
              <br />
              • 인증 코드를 타인과 공유하지 마세요
              <br />• 계정 보안을 위해 강력한 비밀번호를 사용하세요
            </Text>
          </Column>
        </Row>
      </Section>

      {/* 지원 안내 */}
      <Section style={sectionStyle}>
        <Text style={supportTextStyle}>
          궁금한 점이 있으시면 언제든 고객센터로 문의해 주세요.
          <br />
          최고의 서비스로 보답하겠습니다.
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
  color: "#1f2937",
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

const greetingStyle = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const textStyle = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const methodTitleStyle = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const buttonSectionStyle = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const buttonStyle = {
  backgroundColor: "#667eea",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px 32px",
  display: "inline-block",
  border: "none",
  cursor: "pointer",
};

const codeSectionStyle = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const codeStyle = {
  backgroundColor: "#f8f9fa",
  border: "2px solid #e9ecef",
  borderRadius: "8px",
  padding: "16px 24px",
  fontFamily: '"Courier New", monospace',
  fontSize: "28px",
  fontWeight: "bold",
  letterSpacing: "4px",
  color: "#495057",
  textAlign: "center" as const,
  display: "inline-block",
  margin: "0",
};

const warningSectionStyle = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const warningTitleStyle = {
  color: "#856404",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const warningTextStyle = {
  color: "#856404",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const supportTextStyle = {
  color: "#6b7280",
  fontSize: "15px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0",
};
