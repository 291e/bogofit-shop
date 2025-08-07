import {
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import { BaseEmail } from "./BaseEmail";

export interface EmailChangeVerificationEmailProps {
  userName: string;
  verificationCode: string;
  verificationUrl: string;
  oldEmail: string;
  newEmail: string;
  appUrl: string;
}

export function EmailChangeVerificationEmail({
  userName,
  verificationCode,
  verificationUrl,
  oldEmail,
  newEmail,
}: EmailChangeVerificationEmailProps) {
  return (
    <BaseEmail title="BogoFit Shop - 이메일 주소 변경 인증번호">
      <Section style={main}>
        <Container style={container}>
          {/* 메인 타이틀 */}
          <Section style={titleSection}>
            <Heading style={h1}>🔄 이메일 주소 변경</Heading>
            <Text style={subtitle}>새로운 이메일 주소 인증이 필요합니다</Text>
          </Section>

          {/* 인사말 */}
          <Section style={contentSection}>
            <Text style={greeting}>안녕하세요, {userName}님!</Text>
            <Text style={text}>
              계정의 이메일 주소 변경 요청을 확인했습니다. 새로운 이메일 주소로
              변경을 완료하려면 인증을 완료해주세요.
            </Text>
          </Section>

          {/* 변경 정보 */}
          <Section style={changeInfoSection}>
            <Text style={sectionTitle}>📧 변경 정보</Text>
            <Container style={emailChangeContainer}>
              <Text style={emailLabel}>기존 이메일:</Text>
              <Text style={oldEmailText}>{oldEmail}</Text>
              <Text style={arrow}>⬇️</Text>
              <Text style={emailLabel}>새로운 이메일:</Text>
              <Text style={newEmailText}>{newEmail}</Text>
            </Container>
          </Section>

          {/* 인증 방법 1: 버튼 */}
          <Section style={verificationSection}>
            <Text style={sectionTitle}>✅ 방법 1: 버튼으로 인증</Text>
            <Button style={button} href={verificationUrl}>
              새 이메일 주소 인증하기
            </Button>
          </Section>

          <Hr style={hr} />

          {/* 인증 방법 2: 코드 입력 */}
          <Section style={verificationSection}>
            <Text style={sectionTitle}>🔢 방법 2: 인증번호 입력</Text>
            <Text style={text}>앱에서 아래 인증번호를 입력해주세요:</Text>
            <Container style={codeContainer}>
              <Text style={code}>{verificationCode}</Text>
            </Container>
            <Text style={smallText}>인증번호는 10분간 유효합니다.</Text>
          </Section>

          <Hr style={hr} />

          {/* 보안 안내 */}
          <Section style={securitySection}>
            <Text style={securityTitle}>🛡️ 중요한 보안 안내</Text>
            <Text style={smallText}>
              • 본인이 요청하지 않은 변경이라면 즉시 고객센터에 문의하세요
              <br />
              • 이메일 변경 후에는 새 이메일로만 로그인 가능합니다
              <br />
              • 인증을 완료하지 않으면 이메일 주소가 변경되지 않습니다
              <br />• 인증번호는 타인과 공유하지 마세요
            </Text>
          </Section>

          {/* 문의 안내 */}
          <Section style={supportSection}>
            <Text style={sectionTitle}>💬 문의가 있으신가요?</Text>
            <Text style={text}>
              이메일 주소 변경과 관련해 궁금한 점이 있으시면 언제든 연락주세요.
            </Text>
            <Text style={smallText}>
              📧 이메일: bogofit@naver.com
              <br />
              🕒 운영시간: 평일 09:00 - 18:00
            </Text>
          </Section>
        </Container>
      </Section>
    </BaseEmail>
  );
}

// 스타일 정의
const main = {
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0 20px",
  maxWidth: "600px",
};

const titleSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
};

const subtitle = {
  color: "#6b7280",
  fontSize: "16px",
  textAlign: "center" as const,
  margin: "0",
};

const contentSection = {
  marginBottom: "24px",
};

const greeting = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const changeInfoSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#fef3cd",
  borderRadius: "8px",
  border: "1px solid #f59e0b",
};

const emailChangeContainer = {
  textAlign: "center" as const,
  padding: "16px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "12px 0",
};

const emailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0 0 4px 0",
};

const oldEmailText = {
  color: "#dc2626",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
  textDecoration: "line-through",
};

const arrow = {
  fontSize: "20px",
  margin: "8px 0",
};

const newEmailText = {
  color: "#059669",
  fontSize: "16px",
  fontWeight: "600",
  margin: "8px 0 0 0",
};

const verificationSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const sectionTitle = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "0 auto",
  maxWidth: "220px",
};

const codeContainer = {
  textAlign: "center" as const,
  margin: "16px 0",
  padding: "16px",
  backgroundColor: "#ffffff",
  border: "2px solid #3b82f6",
  borderRadius: "8px",
};

const code = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  letterSpacing: "4px",
  margin: "0",
  fontFamily: "monospace",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
  borderTop: "1px solid #e5e7eb",
  borderLeft: "none",
  borderRight: "none",
  borderBottom: "none",
};

const securitySection = {
  marginBottom: "24px",
  padding: "16px",
  backgroundColor: "#fee2e2",
  borderRadius: "8px",
  border: "1px solid #dc2626",
};

const securityTitle = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const smallText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const supportSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  border: "1px solid #3b82f6",
};
