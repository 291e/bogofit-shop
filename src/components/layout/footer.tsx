import { Logo } from "@/components/ui/logo";
import { 
  Facebook,  
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Logo useImage={true} className="h-18 w-18" imageSrc="/Logo/BOGOFIT LOGO.png" imageAlt="BOGOFIT Logo" />
              <div>
                <h4 className="text-lg font-bold">BOGOFIT</h4>
                <p className="text-sm text-gray-400">Fashion & Lifestyle</p>
              </div>
            </div>
            <p className="text-gray-300 mb-3 leading-relaxed text-sm">
              해외직구, 쉽고 빠르게 BOGOFIT에서!
            </p>
            <p className="text-gray-300 mb-4 leading-relaxed text-sm">
              전 세계 인기 상품을 한 곳에서, 믿을 수 있는 구매대행 서비스
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-fuchsia-400 transition-colors duration-200 p-1.5 rounded-lg hover:bg-gray-800">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-fuchsia-400 transition-colors duration-200 p-1.5 rounded-lg hover:bg-gray-800">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-fuchsia-400 transition-colors duration-200 p-1.5 rounded-lg hover:bg-gray-800">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-semibold mb-4 text-base">메뉴</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-fuchsia-400 transition-colors duration-200 flex items-center group">
                <span className="w-1 h-1 bg-fuchsia-400 rounded-full mr-2 group-hover:scale-150 transition-transform duration-200"></span>
                회사소개
              </a></li>
              <li><a href="#" className="hover:text-fuchsia-400 transition-colors duration-200 flex items-center group">
                <span className="w-1 h-1 bg-fuchsia-400 rounded-full mr-2 group-hover:scale-150 transition-transform duration-200"></span>
                이용약관
              </a></li>
              <li><a href="#" className="hover:text-fuchsia-400 transition-colors duration-200 flex items-center group">
                <span className="w-1 h-1 bg-fuchsia-400 rounded-full mr-2 group-hover:scale-150 transition-transform duration-200"></span>
                개인정보처리방침
              </a></li>
            </ul>
          </div>

          {/* Customer Center */}
          <div>
            <h4 className="font-semibold mb-4 text-base">고객센터</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center space-x-2 group">
                <div className="p-1.5 rounded-lg bg-gray-800 group-hover:bg-fuchsia-600 transition-colors duration-200">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm">1:1 문의 metabank@naver.com</span>
              </li>
              <li className="flex items-center space-x-2 group">
                <div className="p-1.5 rounded-lg bg-gray-800 group-hover:bg-fuchsia-600 transition-colors duration-200">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm">042-385-1008 (평일 10:00~18:00)</span>
              </li>
            </ul>
          </div>

          {/* Company Information */}
          <div>
            <h4 className="font-semibold mb-4 text-base">회사정보</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>상호: (주)메타뱅크 | 대표: 소요환</li>
              <li>사업자등록번호: 755-86-02418</li>
              <li>주소: 대전광역시 대덕구 한남로 70 한남대캠퍼스혁신파크 B동 205호</li>
              <li>통신판매번호: 2023-대전유성-1388</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-center">
            <div className="text-gray-400 text-sm">
              <p>&copy; 2025 BOGOFIT SHOP. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 