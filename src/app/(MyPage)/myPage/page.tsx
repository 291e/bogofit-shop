"use client";
import { useState } from "react";
import OrderHistory from "@/components/myPage/OrderHistory";
import CouponList from "@/components/myPage/CouponList";
import AddressBook from "@/components/myPage/AddressBook";
import RecentProducts from "@/components/myPage/RecentProducts";
import Cart from "@/components/myPage/Cart";
import ProfileEditLink from "@/components/myPage/ProfileEditLink";
import LogoutButton from "@/components/myPage/LogoutButton";
import { Ticket, MapPin, Clock, User, LogOut } from "lucide-react";

const menuSections = [
  {
    title: "나의 쇼핑 정보",
    items: [
      {
        key: "order",
        label: "주문 내역 조회",
        icon: <Clock className="w-4 h-4" />,
      },
      {
        key: "coupon",
        label: "쿠폰 내역",
        icon: <Ticket className="w-4 h-4" />,
      },
      {
        key: "address",
        label: "배송 주소록 관리",
        icon: <MapPin className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "활동 정보",
    items: [
      {
        key: "recent",
        label: "최근 본 상품",
        icon: <Clock className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "나의 정보",
    items: [
      {
        key: "profile",
        label: "회원 정보 수정",
        icon: <User className="w-4 h-4" />,
      },
      {
        key: "logout",
        label: "로그아웃",
        icon: <LogOut className="w-4 h-4" />,
      },
    ],
  },
];

export default function MyPage() {
  const [selected, setSelected] = useState("order");

  let Content = null;
  if (selected === "order") Content = <OrderHistory />;
  else if (selected === "coupon") Content = <CouponList />;
  else if (selected === "address") Content = <AddressBook />;
  else if (selected === "recent") Content = <RecentProducts />;
  else if (selected === "cart") Content = <Cart />;
  else if (selected === "profile") Content = <ProfileEditLink />;
  else if (selected === "logout") Content = <LogoutButton />;

  return (
    <main className="max-w-5xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-8">
      {/* 사이드바 */}
      <aside className="w-full md:w-64 flex-shrink-0 mb-4 md:mb-0">
        <nav className="bg-white rounded-2xl shadow p-4 flex flex-col gap-6 sticky top-24">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="text-xs font-bold text-gray-400 mb-2 pl-1">
                {section.title}
              </div>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <li key={item.key}>
                    <button
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selected === item.key
                          ? "bg-[#F6E6FA] text-[#D74FDF]"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setSelected(item.key)}
                    >
                      {item.icon} {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      {/* 컨텐츠 */}
      <section className="flex-1 min-w-0">{Content}</section>
    </main>
  );
}
