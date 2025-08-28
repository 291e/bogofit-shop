import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "BogoFit Shop API",
    version: "2.0.0",
    description: "BogoFit Shop API 문서 - 전체 쇼핑몰 및 비즈니스 관리 API",
    contact: {
      name: "BogoFit Team",
      email: "dev@bogofit.com",
    },
    license: {
      name: "MIT",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://bogofit-shop.vercel.app",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "auth-token",
      },
    },
    schemas: {
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", description: "현재 페이지" },
          limit: { type: "integer", description: "페이지당 개수" },
          total: { type: "integer", description: "총 개수" },
          totalPages: { type: "integer", description: "총 페이지 수" },
          hasNext: { type: "boolean", description: "다음 페이지 여부" },
          hasPrev: { type: "boolean", description: "이전 페이지 여부" },
        },
      },
      LoginResult: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          token: { type: "string", nullable: true },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "상품 ID",
          },
          name: {
            type: "string",
            description: "상품명",
          },
          title: {
            type: "string",
            description: "상품 제목",
          },
          price: {
            type: "number",
            description: "가격",
          },
          originalPrice: {
            type: "number",
            description: "원래 가격",
          },
          discountRate: {
            type: "number",
            description: "할인율",
          },
          description: {
            type: "string",
            description: "상품 설명",
          },
          images: {
            type: "array",
            items: {
              type: "string",
            },
            description: "상품 이미지 URL 목록",
          },
          category: {
            type: "string",
            description: "카테고리",
          },
          stock: {
            type: "integer",
            description: "재고 수량",
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "SOLD_OUT", "DISCONTINUED"],
            description: "상품 상태",
          },
          shippingType: {
            type: "string",
            enum: ["DOMESTIC", "OVERSEAS"],
            description: "배송 타입 (DOMESTIC: 국내, OVERSEAS: 해외)",
            default: "OVERSEAS",
          },
          brandId: {
            type: "string",
            description: "브랜드 ID",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "생성 시간",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "수정 시간",
          },
        },
      },
      Business: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "비즈니스 ID",
          },
          userId: {
            type: "string",
            description: "사용자 ID",
          },
          businessName: {
            type: "string",
            description: "비즈니스명",
          },
          businessNumber: {
            type: "string",
            description: "사업자 번호",
          },
          businessType: {
            type: "string",
            enum: ["BRAND", "SELLER", "DISTRIBUTOR"],
            description: "비즈니스 유형",
          },
          description: {
            type: "string",
            description: "비즈니스 설명",
          },
          location: {
            type: "string",
            description: "위치",
          },
          website: {
            type: "string",
            description: "웹사이트 URL",
          },
          contactEmail: {
            type: "string",
            format: "email",
            description: "연락처 이메일",
          },
          contactPhone: {
            type: "string",
            description: "연락처 전화번호",
          },
          isApproved: {
            type: "boolean",
            description: "승인 상태",
          },
          approvedAt: {
            type: "string",
            format: "date-time",
            description: "승인 시간",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "생성 시간",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "수정 시간",
          },
        },
      },
      Brand: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "브랜드 ID",
          },
          name: {
            type: "string",
            description: "브랜드명",
          },
          slug: {
            type: "string",
            description: "브랜드 슬러그",
          },
          description: {
            type: "string",
            description: "브랜드 설명",
            nullable: true,
          },
          logo: {
            type: "string",
            description: "브랜드 로고 URL",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
            description: "브랜드 상태",
          },
          isActive: {
            type: "boolean",
            description: "활성 상태",
          },
          productCount: {
            type: "integer",
            description: "상품 개수",
          },
          userCount: {
            type: "integer",
            description: "소속 사용자 수",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "생성 시간",
          },
        },
      },
      VirtualFittingRequest: {
        type: "object",
        properties: {
          productNo: {
            type: "integer",
            description: "상품 번호",
          },
          humanImageUrl: {
            type: "string",
            description: "사람 이미지 URL",
          },
          garmentImageUrl: {
            type: "string",
            description: "의류 이미지 URL",
          },
          lowerImageUrl: {
            type: "string",
            description: "하의 이미지 URL (선택사항)",
          },
        },
        required: ["productNo", "humanImageUrl", "garmentImageUrl"],
      },
      VirtualFittingResponse: {
        type: "object",
        properties: {
          resultImageUrl: {
            type: "string",
            description: "가상 피팅 결과 이미지 URL",
          },
          videoUrl: {
            type: "string",
            description: "가상 피팅 결과 비디오 URL",
          },
          taskId: {
            type: "string",
            description: "작업 ID",
          },
          status: {
            type: "string",
            enum: ["pending", "processing", "completed", "failed"],
            description: "작업 상태",
          },
        },
      },
      Cafe24Product: {
        type: "object",
        properties: {
          product_no: {
            type: "integer",
            description: "카페24 상품 번호",
          },
          product_name: {
            type: "string",
            description: "상품명",
          },
          brand_name: {
            type: "string",
            description: "브랜드명",
          },
          category: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category_no: {
                  type: "integer",
                },
                category_name: {
                  type: "string",
                },
              },
            },
            description: "카테고리 목록",
          },
          price: {
            type: "number",
            description: "가격",
          },
          original_price: {
            type: "number",
            description: "원래 가격",
          },
          discount_rate: {
            type: "number",
            description: "할인율",
          },
          images: {
            type: "array",
            items: {
              type: "string",
            },
            description: "상품 이미지 URL 목록",
          },
          colors: {
            type: "array",
            items: {
              type: "string",
            },
            description: "사용 가능한 색상 목록",
          },
          sizes: {
            type: "array",
            items: {
              type: "string",
            },
            description: "사용 가능한 사이즈 목록",
          },
        },
      },
      ProductReview: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "리뷰 ID",
          },
          productId: {
            type: "string",
            description: "상품 ID",
          },
          userId: {
            type: "string",
            description: "사용자 ID",
          },
          rating: {
            type: "integer",
            minimum: 1,
            maximum: 5,
            description: "평점 (1-5)",
          },
          title: {
            type: "string",
            description: "리뷰 제목",
          },
          content: {
            type: "string",
            description: "리뷰 내용",
          },
          images: {
            type: "array",
            items: {
              type: "string",
            },
            description: "리뷰 이미지 URL 목록",
          },
          isRecommended: {
            type: "boolean",
            description: "추천 여부",
          },
          size: {
            type: "string",
            description: "구매한 사이즈",
          },
          color: {
            type: "string",
            description: "구매한 색상",
          },
          height: {
            type: "integer",
            description: "사용자 키",
          },
          weight: {
            type: "integer",
            description: "사용자 몸무게",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "리뷰 작성 시간",
          },
        },
      },
      Address: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "주소 ID",
          },
          userId: {
            type: "string",
            description: "사용자 ID",
          },
          name: {
            type: "string",
            description: "주소명",
          },
          recipient: {
            type: "string",
            description: "수령인",
          },
          phone: {
            type: "string",
            description: "전화번호",
          },
          zipCode: {
            type: "string",
            description: "우편번호",
          },
          address: {
            type: "string",
            description: "기본 주소",
          },
          detailAddress: {
            type: "string",
            description: "상세 주소",
          },
          isDefault: {
            type: "boolean",
            description: "기본 주소 여부",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "생성 시간",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "에러 메시지",
          },
          statusCode: {
            type: "integer",
            description: "HTTP 상태 코드",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "에러 발생 시간",
          },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "장바구니 아이템 ID",
          },
          productId: {
            type: "string",
            description: "상품 ID",
          },
          quantity: {
            type: "integer",
            description: "수량",
          },
          size: {
            type: "string",
            description: "사이즈",
          },
          color: {
            type: "string",
            description: "색상",
          },
          price: {
            type: "number",
            description: "단가",
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "주문 ID",
          },
          userId: {
            type: "string",
            description: "사용자 ID",
          },
          items: {
            type: "array",
            items: {
              $ref: "#/components/schemas/CartItem",
            },
            description: "주문 아이템 목록",
          },
          totalAmount: {
            type: "number",
            description: "총 주문 금액",
          },
          status: {
            type: "string",
            enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
            description: "주문 상태",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "주문 생성 시간",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "사용자 ID",
          },
          userId: {
            type: "string",
            description: "사용자 고유 ID",
          },
          email: {
            type: "string",
            format: "email",
            description: "이메일 주소",
          },
          name: {
            type: "string",
            description: "이름",
          },
          phone: {
            type: "string",
            description: "전화번호",
          },
          phoneNumber: {
            type: "string",
            description: "전화번호",
          },
          profile: {
            type: "string",
            description: "프로필 이미지 URL",
          },
          isBusiness: {
            type: "boolean",
            description: "비즈니스 사용자 여부",
          },
          isAdmin: {
            type: "boolean",
            description: "관리자 여부",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "가입 시간",
          },
        },
      },
      PaymentHistory: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "결제 ID",
          },
          orderId: {
            type: "string",
            description: "주문 ID",
          },
          amount: {
            type: "number",
            description: "결제 금액",
          },
          method: {
            type: "string",
            description: "결제 방법",
          },
          status: {
            type: "string",
            enum: ["pending", "completed", "failed", "cancelled"],
            description: "결제 상태",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "결제 시간",
          },
        },
      },
      SmsRequest: {
        type: "object",
        properties: {
          sender: {
            type: "string",
            description: "발신자 전화번호 (최대 16bytes, 사전 등록 필요)",
            example: "025114560",
          },
          receiver: {
            type: "string",
            description: "수신자 전화번호 (컴마로 구분하여 최대 1천명)",
            example: "01012345678,01087654321",
          },
          msg: {
            type: "string",
            description: "메시지 내용 (1~2,000Byte)",
            example: "안녕하세요! 테스트 메시지입니다.",
          },
          msgType: {
            type: "string",
            enum: ["SMS", "LMS", "MMS"],
            description: "메시지 타입 (생략시 자동 판단)",
          },
          title: {
            type: "string",
            description: "문자 제목 (LMS, MMS만 허용, 1~44Byte)",
          },
          destination: {
            type: "string",
            description: "%고객명% 치환용 데이터",
          },
          rdate: {
            type: "string",
            description: "예약일 (YYYYMMDD)",
          },
          rtime: {
            type: "string",
            description: "예약시간 (HHII)",
          },
          testmodeYn: {
            type: "string",
            enum: ["Y", "N"],
            description: "테스트 모드",
          },
        },
        required: ["sender", "receiver", "msg"],
      },

      SmsResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "요청 성공 여부",
          },
          data: {
            type: "object",
            properties: {
              result_code: {
                type: "number",
                description: "결과 코드 (1: 성공)",
              },
              message: {
                type: "string",
                description: "결과 메시지",
              },
              msg_id: {
                type: "number",
                description: "메시지 고유 ID",
              },
              success_cnt: {
                type: "number",
                description: "요청 성공 건수",
              },
              error_cnt: {
                type: "number",
                description: "요청 실패 건수",
              },
              msg_type: {
                type: "string",
                description: "실제 전송된 메시지 타입",
              },
            },
          },
          message: {
            type: "string",
            description: "응답 메시지",
          },
        },
      },

      SmsRemainResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "요청 성공 여부",
          },
          data: {
            type: "object",
            properties: {
              result_code: {
                type: "number",
                description: "결과 코드 (1: 성공)",
              },
              message: {
                type: "string",
                description: "결과 메시지",
              },
              SMS_CNT: {
                type: "number",
                description: "단문(SMS) 발송 가능 건수",
              },
              LMS_CNT: {
                type: "number",
                description: "장문(LMS) 발송 가능 건수",
              },
              MMS_CNT: {
                type: "number",
                description: "그림문자(MMS) 발송 가능 건수",
              },
            },
          },
        },
      },

      SmsHistoryResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "요청 성공 여부",
          },
          data: {
            type: "object",
            properties: {
              result_code: {
                type: "number",
                description: "결과 코드 (1: 성공)",
              },
              message: {
                type: "string",
                description: "결과 메시지",
              },
              current_page: {
                type: "number",
                description: "현재 페이지",
              },
              total_count: {
                type: "number",
                description: "전체 건수",
              },
              list: {
                type: "array",
                description: "발송 내역 목록",
                items: {
                  type: "object",
                  properties: {
                    mid: {
                      type: "number",
                      description: "메시지 ID",
                    },
                    user_id: {
                      type: "string",
                      description: "사용자 ID",
                    },
                    sender: {
                      type: "string",
                      description: "발신번호",
                    },
                    receiver: {
                      type: "string",
                      description: "수신번호",
                    },
                    msg: {
                      type: "string",
                      description: "메시지 내용",
                    },
                    msg_type: {
                      type: "string",
                      description: "메시지 타입",
                    },
                    reserve_date: {
                      type: "string",
                      description: "예약일시",
                    },
                    reg_date: {
                      type: "string",
                      description: "등록일시",
                    },
                    send_date: {
                      type: "string",
                      description: "발송일시",
                    },
                    result_code: {
                      type: "number",
                      description: "발송결과 코드",
                    },
                    result_message: {
                      type: "string",
                      description: "발송결과 메시지",
                    },
                  },
                },
              },
            },
          },
          pagination: {
            type: "object",
            properties: {
              current_page: {
                type: "number",
                description: "현재 페이지",
              },
              total_count: {
                type: "number",
                description: "전체 건수",
              },
              per_page: {
                type: "number",
                description: "페이지당 건수",
              },
              total_pages: {
                type: "number",
                description: "전체 페이지 수",
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Products",
      description: "상품 관리 API",
    },
    {
      name: "Business",
      description: "비즈니스 관리 API",
    },
    {
      name: "Brand",
      description: "브랜드 관리 API",
    },
    {
      name: "Cafe24",
      description: "카페24 연동 API",
    },
    {
      name: "Cart",
      description: "장바구니 API",
    },
    {
      name: "Orders",
      description: "주문 관리 API",
    },
    {
      name: "Auth",
      description: "인증 관리 API",
    },
    {
      name: "Address",
      description: "배송 주소 관리 API",
    },
    {
      name: "User",
      description: "사용자 관리 API",
    },
    {
      name: "Payment",
      description: "결제 관리 API",
    },
    {
      name: "SMS",
      description: "ALIGO SMS 문자 발송 API",
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  // Next.js route handlers with JSDoc swagger annotations
  apis: ["./src/app/api/**/*.ts", "./src/app/api/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
