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

export interface WelcomeEmailProps {
  userName: string;
  appUrl: string;
}

export const WelcomeEmail = ({ userName, appUrl }: WelcomeEmailProps) => {
  return (
    <BaseEmail
      title="환영합니다!"
      previewText={`${userName}님, BogoFit Shop에 오신 것을 환영합니다! 특별 혜택을 확인하세요.`}
    >
      {/* 메인 제목 */}
      <Section style={headerSectionStyle}>
        <Heading style={mainTitleStyle}>🎉 환영합니다!</Heading>
        <Text style={subtitleStyle}>
          BogoFit Shop 가족이 되어주셔서 감사합니다
        </Text>
      </Section>

      {/* 환영 메시지 */}
      <Section style={sectionStyle}>
        <Heading style={greetingStyle}>{userName}님, 환영합니다!</Heading>
        <Text style={textStyle}>
          BogoFit Shop에 가입해 주셔서 진심으로 감사합니다. 이제 모든 서비스를
          이용하실 수 있습니다.
        </Text>
      </Section>

      {/* 서비스 소개 */}
      <Section style={sectionStyle}>
        <Heading style={featureTitleStyle}>🚀 지금 바로 시작해보세요</Heading>
        <Section style={featureListStyle}>
          <Row style={featureRowStyle}>
            <Column style={featureIconStyle}>
              <Text style={featureIconTextStyle}>💪</Text>
            </Column>
            <Column style={featureContentStyle}>
              <Text style={featureTextStyle}>최신 피트니스 용품 둘러보기</Text>
            </Column>
          </Row>
          <Row style={featureRowStyle}>
            <Column style={featureIconStyle}>
              <Text style={featureIconTextStyle}>🎯</Text>
            </Column>
            <Column style={featureContentStyle}>
              <Text style={featureTextStyle}>
                개인 맞춤 운동 용품 추천 받기
              </Text>
            </Column>
          </Row>
          <Row style={featureRowStyle}>
            <Column style={featureIconStyle}>
              <Text style={featureIconTextStyle}>🏷️</Text>
            </Column>
            <Column style={featureContentStyle}>
              <Text style={featureTextStyle}>회원 전용 할인 혜택 확인하기</Text>
            </Column>
          </Row>
          <Row style={featureRowStyle}>
            <Column style={featureIconStyle}>
              <Text style={featureIconTextStyle}>📚</Text>
            </Column>
            <Column style={featureContentStyle}>
              <Text style={featureTextStyle}>
                전문가의 운동 팁과 가이드 읽기
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* CTA 버튼 */}
      <Section style={buttonSectionStyle}>
        <Button href={appUrl} style={buttonStyle}>
          🛒 쇼핑 시작하기
        </Button>
      </Section>

      {/* 특별 혜택 */}
      <Section style={benefitSectionStyle}>
        <Row>
          <Column>
            <Text style={benefitTitleStyle}>💡 첫 구매 특별 혜택</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={benefitTextStyle}>
              첫 구매 시 <strong>10% 할인 쿠폰</strong>을 드립니다!
              <br />
              마이페이지에서 쿠폰을 확인하고 사용하세요.
            </Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ textAlign: "center", marginTop: "16px" }}>
            <Button href={`${appUrl}/mypage/coupons`} style={couponButtonStyle}>
              🎫 내 쿠폰 확인하기
            </Button>
          </Column>
        </Row>
      </Section>

      {/* 인기 카테고리 */}
      <Section style={sectionStyle}>
        <Heading style={featureTitleStyle}>🔥 인기 카테고리</Heading>
        <Section style={categoryGridStyle}>
          <Row>
            <Column style={categoryItemStyle}>
              <Button
                href={`${appUrl}/categories/home-gym`}
                style={categoryButtonStyle}
              >
                🏠 홈짐
              </Button>
            </Column>
            <Column style={categoryItemStyle}>
              <Button
                href={`${appUrl}/categories/cardio`}
                style={categoryButtonStyle}
              >
                🏃‍♂️ 유산소
              </Button>
            </Column>
          </Row>
          <Row>
            <Column style={categoryItemStyle}>
              <Button
                href={`${appUrl}/categories/weights`}
                style={categoryButtonStyle}
              >
                🏋️‍♀️ 웨이트
              </Button>
            </Column>
            <Column style={categoryItemStyle}>
              <Button
                href={`${appUrl}/categories/yoga`}
                style={categoryButtonStyle}
              >
                🧘‍♀️ 요가
              </Button>
            </Column>
          </Row>
        </Section>
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
  color: "#059669",
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
  marginBottom: "32px",
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

const featureTitleStyle = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 20px 0",
};

const featureListStyle = {
  margin: "0",
};

const featureRowStyle = {
  marginBottom: "12px",
};

const featureIconStyle = {
  width: "40px",
  textAlign: "center" as const,
  verticalAlign: "top",
};

const featureContentStyle = {
  paddingLeft: "12px",
  verticalAlign: "top",
};

const featureIconTextStyle = {
  fontSize: "20px",
  margin: "0",
};

const featureTextStyle = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.5",
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
  fontSize: "18px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "16px 40px",
  display: "inline-block",
  border: "none",
  cursor: "pointer",
};

const benefitSectionStyle = {
  backgroundColor: "#ecfdf5",
  border: "2px solid #10b981",
  borderRadius: "12px",
  padding: "24px",
  margin: "32px 0",
};

const benefitTitleStyle = {
  color: "#047857",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
};

const benefitTextStyle = {
  color: "#047857",
  fontSize: "16px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0",
};

const couponButtonStyle = {
  backgroundColor: "#f59e0b",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "10px 20px",
  display: "inline-block",
  border: "none",
  cursor: "pointer",
};

const categoryGridStyle = {
  margin: "0",
};

const categoryItemStyle = {
  width: "50%",
  padding: "8px",
  textAlign: "center" as const,
};

const categoryButtonStyle = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  color: "#374151",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 16px",
  display: "inline-block",
  border: "1px solid #d1d5db",
  cursor: "pointer",
  width: "100%",
};

const supportTextStyle = {
  color: "#6b7280",
  fontSize: "15px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0",
};
