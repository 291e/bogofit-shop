import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">로그아웃</h2>
      <button
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4" /> 로그아웃
      </button>
    </div>
  );
}
