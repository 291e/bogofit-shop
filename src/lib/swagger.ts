import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "BogoFit Shop API",
    version: "1.0.0",
    description: "BogoFit Shop API 문서",
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
          price: {
            type: "number",
            description: "가격",
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
          isActive: {
            type: "boolean",
            description: "활성 상태",
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
          productName: {
            type: "string",
            description: "상품명",
          },
          brandName: {
            type: "string",
            description: "브랜드명",
          },
          category: {
            type: "string",
            description: "카테고리",
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
            type: "string",
            description: "카테고리",
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
          address: {
            type: "string",
            description: "주소",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "가입 시간",
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
      description: "결제 확인 API",
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/app/api/**/*.ts", "./src/app/api/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
