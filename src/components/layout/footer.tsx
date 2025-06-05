import { Github, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center justify-center border-t bg-gradient-to-r from-gray-50 via-white to-gray-100 text-xs text-gray-500 py-6 px-2 mt-8">
      <div className="flex gap-3 mb-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="깃허브"
        >
          <Github className="w-5 h-5 hover:text-black transition-colors" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="인스타그램"
        >
          <Instagram className="w-5 h-5 hover:text-pink-500 transition-colors" />
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="페이스북"
        >
          <Facebook className="w-5 h-5 hover:text-blue-600 transition-colors" />
        </a>
      </div>
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center">
        <span>© 2025 BOGOFIT SHOP. 모든 권리 보유.</span>
        <span className="hidden sm:inline">|</span>
        <a href="/terms" className="hover:underline">
          이용약관
        </a>
        <span className="hidden sm:inline">|</span>
        <a href="/privacy" className="hover:underline">
          개인정보처리방침
        </a>
      </div>
    </footer>
  );
}
