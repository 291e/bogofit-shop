"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Calendar,
} from "lucide-react";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const shopData = {
    name: "My Awesome Shop",
    avatar: "/logo/bogofit logo.png",
  };

  // Separate states for each menu with children
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    products: false,
    orders: false,
    events: false,
  });

  const sidebarItems = [
    {
      icon: ShoppingBag,
      label: "상품",
      key: "products",
      href: "/home/products",
      children: [
        { label: "상품 목록", href: "/home/products/list" },
        { label: "상품 등록", href: "/home/products/new" },
      ],
    },
    { 
      icon: Package, 
      label: "주문", 
      key: "orders",
      href: "/home/orders",
      children: [
        { label: "주문 목록", href: "/home/orders/list" },
        { label: "주문 등록", href: "/home/orders/new" },
      ],
    },
    {
      icon: Calendar,
      label: "이벤트",
      key: "events", 
      href: "/home/event",
      children: [
        { label: "이벤트 목록", href: "/home/events/list" },
        { label: "이벤트 등록", href: "/home/events/new" },
      ],
    },
    { icon: BarChart3, label: "보고서", href: "/home/reports" },
    { icon: Settings, label: "설정", href: "/home/settings" },
  ];

  const toggleMenu = (menuKey: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 flex flex-col">
      {/* Toggle Button for mobile + tablet */}
      <div className="p-4 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Layout Container */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white shadow-md border-r flex-shrink-0
          ${sidebarOpen ? "block" : "hidden"} 
          lg:block`}
        >
          <div className="flex flex-col h-full min-h-full">
            {/* Shop Info */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {shopData.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{shopData.name}</h2>
                  <p className="text-sm text-gray-500">Seller Dashboard</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => (
                  <li key={item.label}>
                    {item.children ? (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center"
                          onClick={() => toggleMenu(item.key!)}
                          aria-expanded={openMenus[item.key!]}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.label}
                          <span className={`ml-auto transition-transform ${openMenus[item.key!] ? "rotate-90" : "rotate-0"}`}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6"/></svg>
                          </span>
                        </Button>
                        {openMenus[item.key!] && (
                          <ul className="ml-8 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <li key={child.label}>
                                <Link href={child.href}>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-gray-600 hover:bg-blue-50 hover:text-blue-600 text-sm"
                                  >
                                    {child.label}
                                  </Button>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-2 pt-2 min-h-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
