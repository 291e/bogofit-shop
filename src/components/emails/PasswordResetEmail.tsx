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

export interface PasswordResetEmailProps {
  userName: string;
  temporaryPassword: string;
  userId: string;
  appUrl: string;
}

export const PasswordResetEmail = ({
  userName,
  temporaryPassword,
  userId,
  appUrl,
}: PasswordResetEmailProps) => {
  return (
    <BaseEmail
      title="비밀번호 초기화"
      previewText={`${userName}님, 비밀번호가 초기화되었습니다. 임시 비밀번호로 로그인하세요.`}
    >
      {/* 메인 제목 */}
      <Section style={headerSectionStyle}>
        <Heading style={mainTitleStyle}>🔐 비밀번호가 초기화되었습니다</Heading>
        <Text style={subtitleStyle}>새로운 임시 비밀번호로 로그인하세요</Text>
      </Section>

      {/* 인사말 */}
      <Section style={sectionStyle}>
        <Heading style={greetingStyle}>안녕하세요, {userName}님!</Heading>
        <Text style={textStyle}>
          요청하신 비밀번호 초기화가 완료되었습니다. 아래 임시 비밀번호로
          로그인해 주세요.
        </Text>
      </Section>

      {/* 로그인 정보 테이블 */}
      <Section style={sectionStyle}>
        <Heading style={methodTitleStyle}>로그인 정보</Heading>
        <Section style={tableSectionStyle}>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>아이디</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={tableValueTextStyle}>{userId}</Text>
            </Column>
          </Row>
          <Row style={tableRowStyle}>
            <Column style={tableLabelStyle}>
              <Text style={tableLabelTextStyle}>임시 비밀번호</Text>
            </Column>
            <Column style={tableValueStyle}>
              <Text style={passwordStyle}>{temporaryPassword}</Text>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* 로그인 버튼 */}
      <Section style={buttonSectionStyle}>
        <Button href={`${appUrl}/login`} style={buttonStyle}>
          🚀 로그인하기
        </Button>
      </Section>

      {/* 보안 안내 */}
      <Section style={warningSectionStyle}>
        <Row>
          <Column>
            <Text style={warningTitleStyle}>🛡️ 보안 안내</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={warningTextStyle}>
              <strong>즉시 비밀번호를 변경하세요</strong> - 로그인 후 프로필에서
              변경 가능
              <br />
              • 임시 비밀번호는 타인과 절대 공유하지 마세요
              <br />
              • 이 요청을 하지 않았다면 즉시 고객센터에 문의하세요
              <br />• 계정 보안을 위해 강력한 비밀번호로 변경해 주세요
            </Text>
          </Column>
        </Row>
      </Section>

      {/* 추가 도움말 */}
      <Section style={helpSectionStyle}>
        <Text style={helpTitleStyle}>💡 비밀번호 변경 방법</Text>
        <Text style={helpTextStyle}>
          1. 임시 비밀번호로 로그인
          <br />
          2. 우측 상단 프로필 아이콘 클릭
          <br />
          3. &quot;비밀번호 변경&quot; 메뉴 선택
          <br />
          4. 새로운 비밀번호 설정 완료
        </Text>
      </Section>

      {/* 지원 안내 */}
      <Section style={sectionStyle}>
        <Text style={supportTextStyle}>
          계정 보안에 대해 궁금한 점이 있으시면 고객센터로 문의해 주세요.
          <br />
          안전한 BogoFit Shop 이용을 위해 최선을 다하겠습니다.
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
  color: "#dc2626",
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
  width: "40%",
};

const tableValueStyle = {
  backgroundColor: "#ffffff",
  padding: "16px",
  width: "60%",
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

const passwordStyle = {
  backgroundColor: "#f3f4f6",
  border: "2px solid #d1d5db",
  borderRadius: "6px",
  padding: "8px 12px",
  fontFamily: '"Courier New", monospace',
  fontSize: "18px",
  fontWeight: "bold",
  color: "#dc2626",
  display: "inline-block",
  margin: "0",
};

const buttonSectionStyle = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const buttonStyle = {
  backgroundColor: "#059669",
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

const warningSectionStyle = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const warningTitleStyle = {
  color: "#92400e",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const warningTextStyle = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const helpSectionStyle = {
  backgroundColor: "#eff6ff",
  border: "1px solid #3b82f6",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const helpTitleStyle = {
  color: "#1e40af",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const helpTextStyle = {
  color: "#1e40af",
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
