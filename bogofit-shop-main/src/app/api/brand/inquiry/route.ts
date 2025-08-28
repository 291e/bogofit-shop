import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { SmsNotificationService, isTestMode } from "@/lib/sms-notifications";

interface BrandInquiryData {
  // 회사 정보
  companyName: string;
  businessNumber: string;
  companyEmail: string;
  companyPhone: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  establishedYear: string;

  // 담당자 정보
  contactName: string;
  position: string;

  // 브랜드 정보
  brandName: string;
  brandCategory: string;
  brandWebsite: string;
  brandDescription: string;

  // 입점 관련
  expectedLaunchDate: string;
  productCount: string;
  averagePrice: string;
  monthlyRevenue: string;

  // 추가 정보
  hasOnlineStore: boolean;
  marketingBudget: string;
  inquiryDetails: string;
}

/**
 * @swagger
 * /api/brand/inquiry:
 *   post:
 *     summary: 브랜드 입점 문의 전송
 *     description: 브랜드 입점을 위한 문의 이메일을 관리자에게 전송합니다
 *     tags:
 *       - Brand
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - businessNumber
 *               - contactName
 *               - contactEmail
 *               - contactPhone
 *               - brandName
 *               - brandCategory
 *               - inquiryDetails
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: "회사명"
 *                 example: "(주)패션컴퍼니"
 *               businessNumber:
 *                 type: string
 *                 description: "사업자등록번호"
 *                 example: "123-45-67890"
 *               companyAddress:
 *                 type: string
 *                 description: "회사 주소"
 *                 example: "서울시 강남구 테헤란로 123"
 *               establishedYear:
 *                 type: string
 *                 description: "설립년도"
 *                 example: "2020"
 *               contactName:
 *                 type: string
 *                 description: "담당자명"
 *                 example: "홍길동"
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 description: "담당자 이메일"
 *                 example: "contact@company.com"
 *               contactPhone:
 *                 type: string
 *                 description: "담당자 연락처"
 *                 example: "010-1234-5678"
 *               position:
 *                 type: string
 *                 description: "직책"
 *                 example: "마케팅 팀장"
 *               brandName:
 *                 type: string
 *                 description: "브랜드명"
 *                 example: "패션브랜드"
 *               brandCategory:
 *                 type: string
 *                 description: "브랜드 카테고리"
 *                 example: "스포츠웨어"
 *               brandWebsite:
 *                 type: string
 *                 format: uri
 *                 description: "브랜드 웹사이트"
 *                 example: "https://www.brand.com"
 *               brandDescription:
 *                 type: string
 *                 description: "브랜드 소개"
 *                 example: "혁신적인 스포츠웨어 브랜드입니다"
 *               expectedLaunchDate:
 *                 type: string
 *                 format: date
 *                 description: "입점 희망 시기"
 *                 example: "2024-03-01"
 *               productCount:
 *                 type: string
 *                 description: "예상 입점 상품 수"
 *                 example: "100개"
 *               averagePrice:
 *                 type: string
 *                 description: "평균 상품 가격대"
 *                 example: "50,000원"
 *               monthlyRevenue:
 *                 type: string
 *                 description: "월평균 매출"
 *                 example: "10,000,000원"
 *               hasOnlineStore:
 *                 type: boolean
 *                 description: "기존 온라인 쇼핑몰 운영 여부"
 *                 example: true
 *               marketingBudget:
 *                 type: string
 *                 description: "월 마케팅 예산"
 *                 example: "1,000,000원"
 *               inquiryDetails:
 *                 type: string
 *                 description: "상세 문의 내용"
 *                 example: "BogoFit에 입점하여 브랜드를 확장하고 싶습니다"
 *     responses:
 *       200:
 *         description: 문의 전송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "브랜드 입점 문의가 성공적으로 전송되었습니다"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "필수 필드가 누락되었습니다"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "이메일 전송에 실패했습니다"
 */

// 브랜드 입점 문의 이메일 템플릿 생성
function generateBrandInquiryEmail(data: BrandInquiryData): string {
  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>브랜드 입점 문의</title>
    </head>
    <body style="font-family: 'Noto Sans KR', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa;">
      <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- 헤더 -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">브랜드 입점 문의</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">BogoFit 브랜드 입점 신청서</p>
        </div>

        <!-- 접수 정보 -->
        <div style="padding: 20px; background-color: #e3f2fd; border-left: 4px solid #2196f3;">
          <p style="margin: 0; font-size: 14px; color: #1976d2;">
            <strong>📅 접수일시:</strong> ${currentDate}<br>
            <strong>📧 접수경로:</strong> BogoFit 브랜드 입점 문의 시스템
          </p>
        </div>

        <div style="padding: 30px;">
          
          <!-- 회사 정보 -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #3498db;">
              🏢 회사 정보
            </h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; width: 120px; font-weight: bold; color: #495057;">회사명:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">사업자번호:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.businessNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">회사 이메일:</td>
                  <td style="padding: 8px 0;">
                    <a href="mailto:${data.companyEmail}" style="color: #3498db; text-decoration: none;">
                      ${data.companyEmail}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">회사 전화번호:</td>
                  <td style="padding: 8px 0;">
                    <a href="tel:${data.companyPhone}" style="color: #3498db; text-decoration: none;">
                      ${data.companyPhone}
                    </a>
                  </td>
                </tr>
                ${
                  data.address
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">회사 주소:</td>
                  <td style="padding: 8px 0; color: #212529;">
                    ${data.zipCode ? `(${data.zipCode}) ` : ""}${data.address}
                    ${data.addressDetail ? ` ${data.addressDetail}` : ""}
                  </td>
                </tr>
                `
                    : ""
                }
                ${
                  data.establishedYear
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">설립년도:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.establishedYear}년</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>
          </div>

          <!-- 담당자 정보 -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e74c3c;">
              👤 담당자 정보
            </h2>
            <div style="background: #fff5f5; padding: 20px; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; width: 120px; font-weight: bold; color: #495057;">담당자명:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.contactName}</td>
                </tr>
                ${
                  data.position
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">직책:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.position}</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>
          </div>

          <!-- 브랜드 정보 -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #f39c12;">
              🏷️ 브랜드 정보
            </h2>
            <div style="background: #fffbf0; padding: 20px; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; width: 120px; font-weight: bold; color: #495057;">브랜드명:</td>
                  <td style="padding: 8px 0; color: #212529; font-weight: bold; font-size: 16px;">${data.brandName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">카테고리:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.brandCategory}</td>
                </tr>
                ${
                  data.brandWebsite
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">웹사이트:</td>
                  <td style="padding: 8px 0;">
                    <a href="${data.brandWebsite}" target="_blank" style="color: #f39c12; text-decoration: none;">
                      ${data.brandWebsite}
                    </a>
                  </td>
                </tr>
                `
                    : ""
                }
                ${
                  data.brandDescription
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057; vertical-align: top;">브랜드 소개:</td>
                  <td style="padding: 8px 0; color: #212529; line-height: 1.6;">${data.brandDescription}</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>
          </div>

          <!-- 입점 관련 정보 -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #27ae60;">
              📊 입점 관련 정보
            </h2>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                ${
                  data.expectedLaunchDate
                    ? `
                <tr>
                  <td style="padding: 8px 0; width: 150px; font-weight: bold; color: #495057;">입점 희망시기:</td>
                  <td style="padding: 8px 0; color: #212529;">${new Date(data.expectedLaunchDate).toLocaleDateString("ko-KR")}</td>
                </tr>
                `
                    : ""
                }
                ${
                  data.productCount
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">예상 상품 수:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.productCount}</td>
                </tr>
                `
                    : ""
                }
                ${
                  data.averagePrice
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">평균 가격대:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.averagePrice}</td>
                </tr>
                `
                    : ""
                }
                ${
                  data.monthlyRevenue
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">월평균 매출:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.monthlyRevenue}</td>
                </tr>
                `
                    : ""
                }
                ${
                  data.marketingBudget
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">마케팅 예산:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.marketingBudget}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">온라인몰 운영:</td>
                  <td style="padding: 8px 0; color: #212529;">${data.hasOnlineStore ? "✅ 운영 중" : "❌ 미운영"}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- 문의 내용 -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #9b59b6;">
              💬 문의 내용
            </h2>
            <div style="background: #faf5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #9b59b6;">
              <p style="margin: 0; color: #2d3748; line-height: 1.8; white-space: pre-wrap;">${data.inquiryDetails}</p>
            </div>
          </div>

          <!-- 처리 안내 -->
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin-top: 30px;">
            <h3 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 16px;">📋 처리 안내</h3>
            <ul style="margin: 0; padding-left: 20px; color: #2e7d32;">
              <li>접수된 문의는 3-5 영업일 내에 검토됩니다</li>
              <li>추가 서류나 정보가 필요한 경우 담당자가 연락드립니다</li>
              <li>입점 조건 검토 후 상세한 가이드를 제공합니다</li>
            </ul>
          </div>

        </div>

        <!-- 푸터 -->
        <div style="background: #2c3e50; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            <strong>BogoFit 브랜드 입점 문의</strong><br>
            📧 bogofit@naver.com | 📞 042-385-1008<br>
            🌐 <a href="https://www.bogofit.kr" style="color: #74b9ff; text-decoration: none;">www.bogofit.kr</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    // FormData 처리
    const formData = await request.formData();

    // 첨부파일 처리
    const attachments: { filename: string; content: Buffer }[] = [];
    const data: Partial<BrandInquiryData> = {};

    // FormData에서 일반 필드와 파일 필드 분리
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("attachment_") && value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        attachments.push({
          filename: value.name,
          content: buffer,
        });
      } else if (typeof value === "string") {
        (data as Record<string, string>)[key] = value;
      }
    }

    // Boolean 값 처리
    data.hasOnlineStore = formData.get("hasOnlineStore") === "true";

    // 필수 필드 검증
    const requiredFields = [
      "companyName",
      "businessNumber",
      "companyEmail",
      "companyPhone",
      "contactName",
      "brandName",
      "brandCategory",
      "inquiryDetails",
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof BrandInquiryData]) {
        return NextResponse.json(
          { success: false, message: `${field} 필드가 필요합니다.` },
          { status: 400 }
        );
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.companyEmail || "")) {
      return NextResponse.json(
        { success: false, message: "올바른 회사 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 관리자에게 이메일 전송
    const emailResult = await sendEmail({
      to: "bogofit@naver.com",
      subject: `[BogoFit] 브랜드 입점 문의 - ${data.brandName} (${data.companyName})`,
      html: generateBrandInquiryEmail(data as BrandInquiryData),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    console.log(`📧 Brand inquiry email sent:`, emailResult);

    if (!emailResult.success) {
      console.error(
        "❌ Failed to send brand inquiry email:",
        emailResult.error
      );
      return NextResponse.json(
        { success: false, message: "이메일 전송에 실패했습니다." },
        { status: 500 }
      );
    }

    // 사업자에게 브랜드 입점 문의 SMS 알림 발송 (설정된 경우)
    const businessPhone = process.env.BUSINESS_NOTIFICATION_PHONE;
    if (businessPhone) {
      const inquiryTime = new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      SmsNotificationService.sendBrandInquiryNotification({
        businessPhone,
        brandName: data.brandName!,
        companyName: data.companyName!,
        contactName: data.contactName!,
        contactPhone: data.companyPhone!,
        inquiryTime,
        testMode: isTestMode,
      }).catch((error) => {
        console.error("[SMS] 브랜드 입점 문의 알림 SMS 발송 실패:", error);
      });
    } else {
      console.warn(
        "⚠️ BUSINESS_NOTIFICATION_PHONE 환경변수가 설정되지 않아 SMS 알림을 발송하지 않습니다."
      );
    }

    // 문의자에게 확인 이메일 전송 (선택사항)
    try {
      await sendEmail({
        to: data.companyEmail!,
        subject: "✅ [BogoFit] 브랜드 입점 문의가 접수되었습니다",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">브랜드 입점 문의 접수 완료</h2>
            <p>안녕하세요, <strong>${data.contactName}</strong>님!</p>
            <p><strong>${data.brandName}</strong> 브랜드의 BogoFit 입점 문의가 성공적으로 접수되었습니다.</p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">접수 정보</h3>
              <p style="margin: 5px 0;">📅 접수일시: ${new Date().toLocaleDateString("ko-KR")}</p>
              <p style="margin: 5px 0;">🏢 회사명: ${data.companyName}</p>
              <p style="margin: 5px 0;">🏷️ 브랜드명: ${data.brandName}</p>
            </div>
            
            <p>담당자가 검토 후 <strong>3-5 영업일</strong> 내에 연락드리겠습니다.</p>
            <p>추가 문의사항이 있으시면 언제든지 연락해 주세요.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              BogoFit 브랜드 입점팀<br>
              📧 bogofit@naver.com | 📞 042-385-1008<br>
              🌐 <a href="https://www.bogofit.kr">www.bogofit.kr</a>
            </p>
          </div>
        `,
      });
    } catch (confirmEmailError) {
      // 확인 이메일 전송 실패는 무시 (주 기능에 영향 없음)
      console.warn("⚠️ Failed to send confirmation email:", confirmEmailError);
    }

    return NextResponse.json({
      success: true,
      message: "브랜드 입점 문의가 성공적으로 전송되었습니다.",
    });
  } catch (error) {
    console.error("❌ Brand inquiry API error:", error);
    return NextResponse.json(
      { success: false, message: "문의 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
