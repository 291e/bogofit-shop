import { useContext } from "react";
import { AuthContext } from "@/providers/AuthProvider";

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// 편의를 위한 별칭 함수들
export const useLogin = () => {
  const { loginWithCredentials } = useAuth();
  return loginWithCredentials;
};

export const useLogout = () => {
  const { logout } = useAuth();
  return logout;
};
