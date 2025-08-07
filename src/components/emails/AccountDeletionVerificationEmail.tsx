import {
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import { BaseEmail } from "./BaseEmail";

export interface AccountDeletionVerificationEmailProps {
  userName: string;
  verificationCode: string;
  verificationUrl: string;
  userId: string;
  appUrl: string;
}

export function AccountDeletionVerificationEmail({
  userName,
  verificationCode,
  verificationUrl,
  userId,
}: AccountDeletionVerificationEmailProps) {
  return (
    <BaseEmail title="BogoFit Shop - 계정 삭제 인증번호">
      <Section style={main}>
        <Container style={container}>
          {/* 메인 타이틀 */}
          <Section style={titleSection}>
            <Heading style={h1}>⚠️ 계정 삭제 확인</Heading>
            <Text style={subtitle}>
              계정 삭제를 완료하려면 본인 인증이 필요합니다
            </Text>
          </Section>

          {/* 경고 메시지 */}
          <Section style={warningSection}>
            <Text style={warningTitle}>🚨 중요한 안내사항</Text>
            <Text style={warningText}>
              계정을 삭제하면 <strong>모든 데이터가 영구적으로 삭제</strong>
              되며, 복구할 수 없습니다. 신중하게 결정해 주세요.
            </Text>
          </Section>

          {/* 인사말 */}
          <Section style={contentSection}>
            <Text style={greeting}>안녕하세요, {userName}님</Text>
            <Text style={text}>
              계정 삭제 요청을 확인했습니다. 본인 확인을 위해 이메일 인증을
              완료해주세요.
            </Text>
          </Section>

          {/* 삭제될 정보 */}
          <Section style={deletionInfoSection}>
            <Text style={sectionTitle}>🗑️ 삭제될 정보</Text>
            <Text style={text}>
              계정 ID: <strong>{userId}</strong>
            </Text>
            <Text style={deletionList}>
              다음 정보들이 영구적으로 삭제됩니다:
              <br />
              • 개인 프로필 정보
              <br />
              • 주문 내역 및 결제 정보
              <br />
              • 포인트 및 쿠폰
              <br />
              • 문의 내역 및 리뷰
              <br />
              • 저장된 배송지 정보
              <br />• 관심 상품 목록
            </Text>
          </Section>

          {/* 인증 방법 1: 버튼 */}
          <Section style={verificationSection}>
            <Text style={sectionTitle}>✅ 방법 1: 버튼으로 인증</Text>
            <Text style={smallText}>
              정말로 계정을 삭제하시겠다면 아래 버튼을 클릭하세요.
            </Text>
            <Button style={deleteButton} href={verificationUrl}>
              계정 삭제 확인하기
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

          {/* 대안 제안 */}
          <Section style={alternativeSection}>
            <Text style={sectionTitle}>💡 계정 삭제 대신 고려해보세요</Text>
            <Text style={text}>
              혹시 이런 이유로 계정을 삭제하려고 하시나요?
            </Text>
            <Text style={smallText}>
              📧 <strong>스팸 이메일이 많이 와요</strong>
              <br />
              → 이메일 수신 설정에서 마케팅 이메일을 차단할 수 있습니다
              <br />
              <br />
              🛒 <strong>더 이상 쇼핑을 하지 않을 것 같아요</strong>
              <br />
              → 계정은 유지하고 알림만 끄는 것을 추천드립니다
              <br />
              <br />
              🔒 <strong>개인정보 보안이 걱정돼요</strong>
              <br />→ 저희는 엄격한 개인정보 보호 정책을 준수하고 있습니다
            </Text>
          </Section>

          {/* 마지막 경고 */}
          <Section style={finalWarningSection}>
            <Text style={finalWarningTitle}>⚠️ 마지막 경고</Text>
            <Text style={finalWarningText}>
              • 본인이 요청하지 않았다면 이 이메일을 무시하세요
              <br />• 계정 삭제는 <strong>되돌릴 수 없습니다</strong>
              <br />
              • 삭제 후 동일한 아이디로 재가입할 수 없습니다
              <br />• 문제가 있으시면 삭제 전에 고객센터에 문의하세요
            </Text>
          </Section>

          {/* 문의 안내 */}
          <Section style={supportSection}>
            <Text style={sectionTitle}>💬 삭제 전에 문의해보세요</Text>
            <Text style={text}>
              계정 삭제와 관련해 궁금하거나 다른 해결책이 필요하시면 연락주세요.
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
  color: "#dc2626",
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

const warningSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  border: "2px solid #dc2626",
};

const warningTitle = {
  color: "#dc2626",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const warningText = {
  color: "#dc2626",
  fontSize: "16px",
  lineHeight: "24px",
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

const deletionInfoSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#fef3cd",
  borderRadius: "8px",
  border: "1px solid #f59e0b",
};

const deletionList = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "12px 0 0 0",
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

const deleteButton = {
  backgroundColor: "#dc2626",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "16px auto 0 auto",
  maxWidth: "200px",
};

const codeContainer = {
  textAlign: "center" as const,
  margin: "16px 0",
  padding: "16px",
  backgroundColor: "#ffffff",
  border: "2px solid #dc2626",
  borderRadius: "8px",
};

const code = {
  color: "#dc2626",
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

const alternativeSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#f0f9ff",
  borderRadius: "8px",
  border: "1px solid #0ea5e9",
};

const finalWarningSection = {
  marginBottom: "24px",
  padding: "16px",
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  border: "1px solid #dc2626",
};

const finalWarningTitle = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const finalWarningText = {
  color: "#dc2626",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
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
