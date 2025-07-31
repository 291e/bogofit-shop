// components/Sidebar.tsx
import { LayoutDashboard, Package, Users, BarChart2, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <div className="p-6 space-y-4">
      <div className="text-xl font-bold">My Awesome Shop</div>
      <nav className="space-y-2">
        <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarItem icon={<Package size={20} />} label="Sản phẩm" />
        <SidebarItem icon={<Users size={20} />} label="Khách hàng" />
        <SidebarItem icon={<BarChart2 size={20} />} label="Báo cáo" />
        <SidebarItem icon={<Settings size={20} />} label="Cài đặt" />
      </nav>
    </div>
  );
}

function SidebarItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-black cursor-pointer">
      {icon}
      {label}
    </div>
  );
}
