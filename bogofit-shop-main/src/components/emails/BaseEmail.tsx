import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Heading,
} from "@react-email/components";
import * as React from "react";

interface BaseEmailProps {
  children: React.ReactNode;
  title: string;
  previewText?: string;
}

export const BaseEmail = ({ children, title, previewText }: BaseEmailProps) => {
  return (
    <Html>
      <Head>
        <title>{title}</title>
        {previewText && (
          <Text
            style={{
              display: "none",
              overflow: "hidden",
              lineHeight: "1px",
              opacity: 0,
              maxHeight: 0,
              maxWidth: 0,
            }}
          >
            {previewText}
          </Text>
        )}
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* 헤더 */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>🎯 BogoFit Shop</Heading>
          </Section>

          {/* 메인 콘텐츠 */}
          <Section style={contentStyle}>{children}</Section>

          {/* 푸터 */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              © 2024 BogoFit Shop. All rights reserved.
            </Text>
            <Text style={footerTextStyle}>
              고객센터:{" "}
              <Link href="mailto:bogofit@naver.com" style={footerLinkStyle}>
                bogofit@naver.com
              </Link>
            </Text>
            <Text style={footerTextStyle}>
              이 이메일은 발신 전용입니다. 회신하지 마세요.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// 스타일 정의
const bodyStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  lineHeight: "1.6",
  color: "#333333",
  margin: 0,
  padding: "20px",
};

const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

const headerStyle = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "40px 32px",
  textAlign: "center" as const,
};

const logoStyle = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
};

const contentStyle = {
  padding: "32px",
};

const footerStyle = {
  backgroundColor: "#f8f9fa",
  padding: "24px 32px",
  borderTop: "1px solid #e9ecef",
};

const footerTextStyle = {
  fontSize: "14px",
  color: "#6c757d",
  textAlign: "center" as const,
  margin: "4px 0",
};

const footerLinkStyle = {
  color: "#667eea",
  textDecoration: "none",
};
