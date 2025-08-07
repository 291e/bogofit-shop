import {
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import { BaseEmail } from "./BaseEmail";

export interface SignupVerificationEmailProps {
  userName: string;
  verificationCode: string;
  verificationUrl: string;
  appUrl: string;
}

export function SignupVerificationEmail({
  userName,
  verificationCode,
  verificationUrl,
}: SignupVerificationEmailProps) {
  return (
    <BaseEmail title="BogoFit Shop - 회원가입 인증번호">
      <Section style={main}>
        <Container style={container}>
          {/* 메인 타이틀 */}
          <Section style={titleSection}>
            <Heading style={h1}>🎉 환영합니다!</Heading>
            <Text style={subtitle}>
              BogoFit Shop 회원가입을 완료하려면 이메일 인증이 필요합니다
            </Text>
          </Section>

          {/* 인사말 */}
          <Section style={contentSection}>
            <Text style={greeting}>안녕하세요, {userName}님!</Text>
            <Text style={text}>
              BogoFit Shop에 가입해 주셔서 감사합니다. 계정 보안을 위해 이메일
              주소 인증을 완료해주세요.
            </Text>
          </Section>

          {/* 인증 방법 1: 버튼 */}
          <Section style={verificationSection}>
            <Text style={sectionTitle}>✅ 방법 1: 버튼으로 인증</Text>
            <Button style={button} href={verificationUrl}>
              이메일 인증 완료하기
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
            <Text style={securityTitle}>🛡️ 보안 안내</Text>
            <Text style={smallText}>
              • 본인이 가입하지 않으셨다면 이 이메일을 무시하세요
              <br />
              • 인증번호는 타인과 공유하지 마세요
              <br />• 문제가 있으시면 고객센터에 문의해주세요
            </Text>
          </Section>

          {/* 서비스 소개 */}
          <Section style={infoSection}>
            <Text style={sectionTitle}>🏃‍♂️ BogoFit Shop 소개</Text>
            <Text style={text}>
              건강한 라이프스타일을 위한 프리미엄 피트니스 용품을 만나보세요!
            </Text>
            <Text style={smallText}>
              • 전문가가 선별한 고품질 운동기구
              <br />
              • 개인 맞춤형 운동 프로그램 추천
              <br />• 빠르고 안전한 배송 서비스
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
  maxWidth: "200px",
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
  backgroundColor: "#fef3cd",
  borderRadius: "8px",
  border: "1px solid #f59e0b",
};

const securityTitle = {
  color: "#92400e",
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

const infoSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  border: "1px solid #3b82f6",
};
