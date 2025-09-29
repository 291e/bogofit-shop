
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            BOGOFIT Shop
          </h1>
          <p className="text-xl text-gray-600">
            AI 가상피팅 쇼핑몰, 내 몸에 딱 맞는 패션 추천
          </p>
          <p className="text-sm text-gray-500 mt-2">
            다양한 브랜드와 상품을 한 곳에서!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-pink-600">추천</CardTitle>
              <CardDescription>
                AI가 추천하는 맞춤 상품
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                개인 맞춤형 상품 추천 서비스
              </p>
              <Link href="/recommend">
                <Button className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500">
                  추천 보기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-pink-600">랭킹</CardTitle>
              <CardDescription>
                인기 상품과 브랜드 순위
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                실시간 인기 상품과 트렌드
              </p>
              <Link href="/ranking">
                <Button className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500">
                  랭킹 보기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-pink-600">세일</CardTitle>
              <CardDescription>
                특가 상품과 할인 이벤트
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                놓치면 안 되는 특가 상품들
              </p>
              <Link href="/sale">
                <Button className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500">
                  세일 보기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-pink-600">브랜드</CardTitle>
              <CardDescription>
                다양한 브랜드 컬렉션
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                프리미엄 브랜드부터 트렌디한 브랜드까지
              </p>
              <Link href="/brands">
                <Button className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500">
                  브랜드 보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-gray-900">BOGOFIT의 특별한 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🤖</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">AI 가상피팅</h3>
                  <p className="text-sm text-gray-600">
                    AI 기술로 내 몸에 딱 맞는 사이즈와 스타일을 추천받으세요
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🛍️</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">다양한 브랜드</h3>
                  <p className="text-sm text-gray-600">
                    프리미엄 브랜드부터 트렌디한 브랜드까지 한 곳에서
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">💎</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">특별한 혜택</h3>
                  <p className="text-sm text-gray-600">
                    회원 전용 할인과 특별 이벤트를 놓치지 마세요
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
