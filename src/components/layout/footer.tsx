import { Instagram, Facebook, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t text-gray-700 text-sm mt-16 pt-10 pb-6 px-4 md:px-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 md:gap-0 px-4 ">
        {/* 브랜드/소개 */}
        <div className="flex-1 flex flex-col gap-2 mb-6 md:mb-0">
          <div className="flex items-center gap-2 mb-1">
            <Image
              src="/BOGOFIT.svg"
              alt="BOGOFIT 로고"
              width={32}
              height={32}
            />
            <span className="text-lg font-bold tracking-wide">BOGOFIT</span>
          </div>
          <span className="text-gray-500">
            해외직구, 쉽고 빠르게 BOGOFIT에서!
          </span>
          <span className="text-xs text-gray-400 max-w-[270px]">
            전 세계 인기 상품을 한 곳에서, 믿을 수 있는 구매대행 서비스
          </span>
        </div>

        {/* 주요 메뉴 */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="font-semibold mb-1">메뉴</span>
          <Link
            href="https://www.metabank3d.com/"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            회사소개
          </Link>
          <Link href="/agreement" className="hover:underline">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:underline">
            개인정보처리방침
          </Link>
        </div>

        {/* 고객센터 */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="font-semibold mb-1">고객센터</span>
          <span>
            1:1 문의{" "}
            <Link
              href="mailto:help@bogofit.com"
              className="text-blue-600 hover:underline ml-1"
            >
              metabank@naver.com
            </Link>
          </span>
          <span>
            042-385-1008{" "}
            <span className="text-xs text-gray-400 ml-1">
              (평일 10:00~18:00)
            </span>
          </span>
        </div>

        {/* 회사정보 */}
        <div className="flex-1  flex flex-col gap-1 text-xs text-gray-500 mt-4 md:mt-0">
          <span className="font-semibold text-sm text-gray-700 mb-1">
            회사정보
          </span>
          <span>상호: (주)메타뱅크 | 대표: 소요환</span>
          <span>사업자등록번호: 755-86-02418</span>
          <span>
            주소: 대전광역시 대덕구 한남로 70 한남대캠퍼스혁신파크 B동 205호
          </span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-full border-t my-6 border-gray-200" />

      {/* 하단: 소셜/저작권 */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between items-center gap-2 md:gap-0">
        <div className="flex gap-3 mb-2 md:mb-0">
          <Link href="https://www.youtube.com/@bogofit">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-black transition-colors shadow hover:scale-110">
              <Youtube className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" />
            </span>
          </Link>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="인스타그램"
            className="group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 group-hover:bg-pink-500 transition-colors shadow hover:scale-110">
              <Instagram className="w-4 h-4 text-pink-500 group-hover:text-white transition-colors" />
            </span>
          </Link>
          <Link
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="페이스북"
            className="group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-600 transition-colors shadow hover:scale-110">
              <Facebook className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
            </span>
          </Link>
        </div>
        <span className="text-xs text-gray-400">
          © 2025 BOGOFIT SHOP. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
