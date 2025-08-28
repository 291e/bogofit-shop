// ALIGO 문자 API 타입 정의

export interface AligoConfig {
  apiKey: string;
  userId: string;
  baseUrl?: string;
}

export interface SmsSendRequest {
  sender: string; // 발신자 전화번호 (최대 16bytes)
  receiver: string; // 수신자 전화번호 - 컴마(,)분기 입력으로 최대 1천명
  msg: string; // 메시지 내용 (1~2,000Byte)
  msgType?: "SMS" | "LMS" | "MMS"; // 메시지 타입
  title?: string; // 문자제목 (LMS,MMS만 허용, 1~44Byte)
  destination?: string; // %고객명% 치환용 입력
  rdate?: string; // 예약일 (YYYYMMDD)
  rtime?: string; // 예약시간 (HHII)
  testmodeYn?: "Y" | "N"; // 연동테스트시 Y 적용
  image1?: File | string; // 첨부이미지
  image2?: File | string; // 첨부이미지
  image3?: File | string; // 첨부이미지
}

export interface SmsSendResponse {
  result_code: number | string; // 결과코드(API 수신유무) - ALIGO가 문자열로 반환하는 경우 있음
  message: string; // 결과 메시지
  msg_id?: number | string; // 메시지 고유 ID
  success_cnt?: number; // 요청성공 건수
  error_cnt?: number; // 요청실패 건수
  msg_type?: string; // 메시지 타입 (1. SMS, 2.LMS, 3. MMS)
}

export interface SmsMassSendRequest {
  sender: string; // 발신자 전화번호
  msgType: "SMS" | "LMS"; // 메시지 타입 (직접 선택 필수)
  title?: string; // 문자제목 (LMS만 허용)
  rdate?: string; // 예약일 (YYYYMMDD)
  rtime?: string; // 예약시간 (HHII)
  testmodeYn?: "Y" | "N"; // 연동테스트시 Y 적용
  // 수신인별 데이터 (최대 500명)
  receivers: Array<{
    receiver: string; // 수신자 전화번호
    destination?: string; // 고객명
    msg: string; // 개별 메시지 내용
  }>;
}

export interface SmsRemainResponse {
  result_code: number | string; // 결과코드 - ALIGO가 문자열로 반환하는 경우 있음
  message: string; // 결과 메시지
  SMS_CNT?: number; // 단문전송시 발송가능한건수
  LMS_CNT?: number; // 장문전송시 발송가능한건수
  MMS_CNT?: number; // 그림(사진)전송시 발송가능한건수
}

export interface SmsListRequest {
  page?: number; // 페이지 번호 (기본 1)
  limit?: number; // 페이지당 건수 (기본 50, 최대 500)
  start_date?: string; // 검색 시작일 (YYYYMMDD)
  end_date?: string; // 검색 종료일 (YYYYMMDD)
}

export interface SmsListResponse {
  result_code: number | string;
  message: string;
  current_page?: number;
  total_count?: number;
  list?: Array<{
    mid: number; // 메시지 ID
    user_id: string; // 사용자 ID
    sender: string; // 발신번호
    receiver: string; // 수신번호
    msg: string; // 메시지 내용
    msg_type: string; // 메시지 타입
    reserve_date: string; // 예약일시
    reg_date: string; // 등록일시
    send_date: string; // 발송일시
    result_code: number; // 발송결과
    result_message: string; // 결과메시지
  }>;
}

export interface SmsDetailRequest {
  mid: number; // 메시지 ID
  page?: number; // 페이지 번호
  limit?: number; // 페이지당 건수
}

export interface SmsDetailResponse {
  result_code: number | string;
  message: string;
  current_page?: number;
  total_count?: number;
  list?: Array<{
    mdid: number; // 상세 ID
    mid: number; // 메시지 ID
    user_id: string; // 사용자 ID
    sender: string; // 발신번호
    receiver: string; // 수신번호
    msg: string; // 메시지 내용
    reserve_date: string; // 예약일시
    send_date: string; // 발송일시
    result_code: number; // 발송결과
    result_message: string; // 결과메시지
  }>;
}

export interface SmsCancelRequest {
  mid: number; // 메시지 ID
}

export interface SmsCancelResponse {
  result_code: number | string;
  message: string;
  cancel_date?: string; // 취소일자 (YYYY-MM-DD HH:II:SS)
}

// 에러 코드 정의
export const ALIGO_ERROR_CODES = {
  SUCCESS: 1,
  AUTH_ERROR: -101,
  INVALID_PARAM: -102,
  INSUFFICIENT_POINT: -201,
  INVALID_PHONE: -301,
  INVALID_SENDER: -302,
  DUPLICATE_REQUEST: -401,
  SERVER_ERROR: -501,
  CANCEL_TIME_OVER: -804,
} as const;

export type AligoErrorCode =
  (typeof ALIGO_ERROR_CODES)[keyof typeof ALIGO_ERROR_CODES];
