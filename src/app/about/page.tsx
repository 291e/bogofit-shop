export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">BOGOFIT 소개</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">우리는?</h2>
        <p className="text-gray-700 leading-relaxed">
          BOGOFIT은 최신 트렌드와 합리적인 가격을 동시에 추구하는 쇼핑
          플랫폼입니다.
          <br />
          고객의 라이프스타일을 반영한 다양한 상품과 특별한 혜택을 제공합니다.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">가치와 비전</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>고객 중심의 서비스</li>
          <li>트렌디한 상품 큐레이션</li>
          <li>투명한 가격 정책</li>
          <li>지속 가능한 성장과 신뢰</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">연락처</h2>
        <p className="text-gray-700">
          이메일:{" "}
          <a
            href="mailto:metabank.ask@gmail.com"
            className="text-blue-600 underline"
          >
            metabank.ask@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
