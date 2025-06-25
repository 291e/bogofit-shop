export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              BOGOFIT SHOP
            </h1>
            <p className="text-2xl text-gray-600 font-light">
              AI 가상피팅 기술이 탑재된 혁신적인 쇼핑 플랫폼
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              메타뱅크에서 개발한{" "}
              <strong className="text-pink-600">보고핏(BOGOFIT) 앱</strong>의
              혁신적인 가상피팅 기술을 온라인 쇼핑에 접목한 차세대 패션 커머스
              플랫폼입니다.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* BOGOFIT App Section */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                보고핏(BOGOFIT) 앱이란?
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    🎯 핵심 기능
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    인공지능(AI) 기술을 활용하여 온라인/오프라인 쇼핑에서 패션
                    상품의 사이즈 및 피팅의 불확실성을 해결하는 정확도가 향상된
                    가상 피팅 기능을 제공합니다.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    🤖 AI 스타일링
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    사용자의 체형, 선호도, 트렌드를 분석하여 최적의 스타일을
                    추천하는 혁신적인 개인화 서비스를 제공합니다.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-600 text-xl">📏</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      정확한 사이즈 측정
                    </h4>
                    <p className="text-gray-600">
                      AI 기반 체형 분석으로 정확한 사이즈 추천
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-xl">👗</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      가상 피팅
                    </h4>
                    <p className="text-gray-600">
                      실제 착용감을 미리 체험할 수 있는 가상 피팅
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xl">✨</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      스타일 추천
                    </h4>
                    <p className="text-gray-600">
                      개인 맞춤형 스타일 큐레이션 서비스
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MetaBank Company Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">㈜메타뱅크</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-white">
                  혁신 기술 기업
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  사실적인 가상 환경과 메타버스 환경 구축을 위해
                  <strong className="text-pink-400"> 인공지능(AI)</strong>과
                  <strong className="text-purple-400">
                    {" "}
                    포토그래메트리(Photogrammetry)
                  </strong>
                  기술을 활용하는 전문 기업입니다.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  카메라로 촬영된 사진 이미지들을 정밀한 2D 또는 3D 데이터로
                  추출하는 고도의 소프트웨어 기술과 관련 솔루션을 개발합니다.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">AI 기술</h4>
                  <p className="text-gray-300 text-sm">
                    머신러닝과 딥러닝을 활용한 이미지 분석 및 패턴 인식 기술
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">
                    포토그래메트리
                  </h4>
                  <p className="text-gray-300 text-sm">
                    사진 측량 기술을 통한 3D 모델링 및 공간 정보 추출
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">메타버스</h4>
                  <p className="text-gray-300 text-sm">
                    가상현실과 현실을 연결하는 차세대 디지털 플랫폼 구축
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Innovation Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">기술 혁신</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                정확도 향상
              </h3>
              <p className="text-gray-600">
                AI 알고리즘 최적화를 통해 기존 대비 85% 이상의 피팅 정확도를
                실현했습니다.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                실시간 처리
              </h3>
              <p className="text-gray-600">
                최적화된 알고리즘으로 실시간 가상 피팅과 즉시 스타일 추천이
                가능합니다.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                개인정보 보호
              </h3>
              <p className="text-gray-600">
                엄격한 데이터 보안 시스템으로 사용자의 개인정보를 안전하게
                보호합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl shadow-xl p-8 md:p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">비전 & 미션</h2>
              <div className="w-24 h-1 bg-white/30 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold mb-6">🌟 우리의 비전</h3>
                <ul className="space-y-4 text-pink-100">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    AI 기술로 패션 산업의 디지털 혁신을 선도
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    사용자 중심의 개인화된 쇼핑 경험 제공
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    지속가능한 패션 생태계 구축에 기여
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">🎯 우리의 미션</h3>
                <ul className="space-y-4 text-purple-100">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    온라인 쇼핑의 사이즈 불확실성 완전 해결
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    반품률 최소화를 통한 환경 보호 실현
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    모든 사용자를 위한 접근성 높은 기술 제공
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Awards & Recognition Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              수상 및 인정
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-600 text-2xl">🏆</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  혁신 기술상
                </h4>
                <p className="text-gray-600 text-sm">AI 패션 기술 부문</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">🌟</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  스타트업 대상
                </h4>
                <p className="text-gray-600 text-sm">패션테크 분야</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">💡</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">우수 특허</h4>
                <p className="text-gray-600 text-sm">3D 피팅 기술</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">🚀</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">성장 인증</h4>
                <p className="text-gray-600 text-sm">벤처기업 확인</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="bg-gray-50 rounded-2xl shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                문의하기
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  연락처 정보
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-pink-600">📧</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">이메일</p>
                      <a
                        href="mailto:metabank@naver.com"
                        className="text-pink-600 hover:text-pink-700 transition-colors"
                      >
                        metabank@naver.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600">🏢</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">회사명</p>
                      <p className="text-gray-600">
                        ㈜메타뱅크 (MetaBank Co., Ltd.)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">💼</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">사업 분야</p>
                      <p className="text-gray-600">
                        AI, 포토그래메트리, 메타버스
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  파트너십 제안
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  BOGOFIT의 혁신적인 가상피팅 기술에 관심이 있거나 비즈니스
                  파트너십을 원하시는 분들은 언제든지 연락해 주세요.
                </p>

                <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-6 text-white">
                  <h4 className="font-semibold mb-2">✨ 협업 기회</h4>
                  <ul className="text-sm space-y-1 text-pink-100">
                    <li>• 패션 브랜드 기술 도입</li>
                    <li>• 쇼핑몰 플랫폼 연동</li>
                    <li>• AI 기술 라이선싱</li>
                    <li>• 공동 연구개발</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
