export default function EventPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-purple-600">이벤트</h1>
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">진행 중인 이벤트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 text-pink-600">
                신규 회원 가입 이벤트
              </h3>
              <p className="text-gray-700 mb-2">
                회원 가입 시 5,000원 할인 쿠폰 증정!
              </p>
              <span className="inline-block bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded">
                ~ 2024.07.31
              </span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 text-purple-600">
                여름 시즌 특가전
              </h3>
              <p className="text-gray-700 mb-2">
                여름 인기 상품 최대 50% 할인!
              </p>
              <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                ~ 2024.08.15
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">지난 이벤트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl shadow p-6">
            <h3 className="font-bold text-lg mb-2 text-gray-500">
              봄맞이 쇼핑 페스티벌
            </h3>
            <p className="text-gray-500 mb-2">
              다양한 봄 상품 할인 및 사은품 증정
            </p>
            <span className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
              종료
            </span>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">이벤트 참여 방법</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>회원 가입 및 로그인</li>
          <li>이벤트 페이지 내 참여 버튼 클릭</li>
          <li>이벤트별 안내에 따라 참여</li>
        </ul>
      </section>
    </main>
  );
}
