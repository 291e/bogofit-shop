import { useCallback } from "react";

// 다음 주소 API 타입 정의
interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: string;
}

interface AddressResult {
  zipCode: string;
  address: string;
}

export const useAddressSearch = () => {
  const openAddressSearch = useCallback(
    (onComplete: (result: AddressResult) => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && (window as any).daum) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (window as any).daum.Postcode({
          oncomplete: function (data: DaumPostcodeData) {
            // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.
            // 각 주소의 노출 규칙에 따라 주소를 조합한다.
            let addr = ""; // 주소 변수

            // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
            if (data.userSelectedType === "R") {
              // 사용자가 도로명 주소를 선택했을 경우
              addr = data.roadAddress;
            } else {
              // 사용자가 지번 주소를 선택했을 경우(J)
              addr = data.jibunAddress;
            }

            // 콜백으로 결과 전달
            onComplete({
              zipCode: data.zonecode,
              address: addr,
            });
          },
        }).open();
      } else {
        alert(
          "주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
        );
      }
    },
    []
  );

  return { openAddressSearch };
};
