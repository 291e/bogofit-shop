import {
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import { BaseEmail } from "./BaseEmail";

export interface ProfileUpdateVerificationEmailProps {
  userName: string;
  verificationCode: string;
  verificationUrl: string;
  updateType: string; // 수정할 정보 타입 (예: "비밀번호", "개인정보" 등)
  appUrl: string;
}

export function ProfileUpdateVerificationEmail({
  userName,
  verificationCode,
  verificationUrl,
  updateType,
}: ProfileUpdateVerificationEmailProps) {
  return (
    <BaseEmail title="프로필 수정 인증">
      <Section style={main}>
        <Container style={container}>
          {/* 메인 타이틀 */}
          <Section style={titleSection}>
            <Heading style={h1}>🔐 프로필 수정 인증</Heading>
            <Text style={subtitle}>
              중요한 정보 변경을 위해 본인 인증이 필요합니다
            </Text>
          </Section>

          {/* 인사말 */}
          <Section style={contentSection}>
            <Text style={greeting}>안녕하세요, {userName}님!</Text>
            <Text style={text}>
              계정의 <strong>{updateType}</strong> 수정 요청을 확인했습니다.
              보안을 위해 이메일 인증을 완료해주세요.
            </Text>
          </Section>

          {/* 수정 정보 안내 */}
          <Section style={updateInfoSection}>
            <Text style={sectionTitle}>🔄 수정 요청 정보</Text>
            <Container style={updateContainer}>
              <Text style={updateTypeText}>수정 항목: {updateType}</Text>
              <Text style={timeText}>
                요청 시간:{" "}
                {new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
              </Text>
            </Container>
          </Section>

          {/* 인증 방법 1: 버튼 */}
          <Section style={verificationSection}>
            <Text style={sectionTitle}>✅ 방법 1: 버튼으로 인증</Text>
            <Button style={button} href={verificationUrl}>
              프로필 수정 인증하기
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

          {/* 보안 정보 */}
          <Section style={securitySection}>
            <Text style={securityTitle}>🛡️ 보안 안내</Text>
            <Text style={smallText}>
              • 본인이 요청하지 않은 변경이라면 즉시 고객센터에 문의하세요
              <br />
              • 인증을 완료하지 않으면 정보가 변경되지 않습니다
              <br />
              • 인증번호는 타인과 공유하지 마세요
              <br />• 의심스러운 활동이 감지되면 임시로 계정이 보호될 수
              있습니다
            </Text>
          </Section>

          {/* 추가 보안 팁 */}
          <Section style={tipsSection}>
            <Text style={sectionTitle}>💡 보안 강화 팁</Text>
            <Text style={text}>더 안전한 계정 관리를 위한 추천사항:</Text>
            <Text style={smallText}>
              🔒 <strong>강력한 비밀번호 사용</strong>
              <br />
              → 8자 이상, 숫자+영문+특수문자 조합
              <br />
              <br />
              📱 <strong>정기적인 비밀번호 변경</strong>
              <br />
              → 3-6개월마다 비밀번호 변경 권장
              <br />
              <br />
              🚫 <strong>공공 Wi-Fi에서 개인정보 수정 금지</strong>
              <br />
              → 안전한 네트워크에서만 중요 정보 변경
              <br />
              <br />
              👀 <strong>계정 활동 주기적 확인</strong>
              <br />→ 의심스러운 로그인 기록이 있는지 확인
            </Text>
          </Section>

          {/* 문의 안내 */}
          <Section style={supportSection}>
            <Text style={sectionTitle}>💬 도움이 필요하신가요?</Text>
            <Text style={text}>
              프로필 수정이나 보안과 관련해 궁금한 점이 있으시면 언제든
              연락주세요.
            </Text>
            <Text style={smallText}>
              📧 이메일: bogofit@naver.com
              <br />
              🕒 운영시간: 평일 09:00 - 18:00
              <br />⚡ 보안 관련 긴급 문의는 24시간 접수 가능
            </Text>
          </Section>

          {/* 추가 정보 */}
          <Section style={infoSection}>
            <Text style={sectionTitle}>ℹ️ 참고사항</Text>
            <Text style={smallText}>
              • 인증 완료 후 변경사항이 즉시 적용됩니다
              <br />
              • 변경 완료 시 별도의 확인 이메일을 발송해드립니다
              <br />• 프로필 변경 내역은 마이페이지에서 확인 가능합니다
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

const updateInfoSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#fef3cd",
  borderRadius: "8px",
  border: "1px solid #f59e0b",
};

const updateContainer = {
  padding: "16px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "12px 0 0 0",
};

const updateTypeText = {
  color: "#92400e",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const timeText = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0",
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

const tipsSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  border: "1px solid #22c55e",
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

const infoSection = {
  marginBottom: "24px",
  padding: "16px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
};
