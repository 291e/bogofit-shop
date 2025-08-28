export interface AddressBookItem {
  id: number;
  label: string;
  recipient: string;
  zipCode: string;
  address1: string;
  address2: string | null;
  phone: string;
  isDefault: boolean;
  isFixed: boolean;
}

export const addressBook: AddressBookItem[] = [
  {
    id: 1,
    label: "집",
    recipient: "홍길동",
    zipCode: "12345",
    address1: "서울특별시 강남구 테헤란로 123",
    address2: "101동 202호",
    phone: "010-1234-5678",
    isDefault: true,
    isFixed: false,
  },
  // ...더미 데이터 추가 가능
];
