"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { DELETE_ACCOUNT } from "@/graphql/mutations";
import { useAuth } from "@/providers/AuthProvider";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userId,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  const [deleteAccount, { loading }] = useMutation(DELETE_ACCOUNT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("비밀번호를 입력하세요.");
      return;
    }

    if (confirmText !== "계정 탈퇴") {
      setError("'계정 탈퇴'를 정확히 입력하세요.");
      return;
    }

    try {
      const { data } = await deleteAccount({
        variables: { userId, password },
      });

      if (data?.deleteAccount?.success) {
        // 로그아웃 처리 (AuthProvider에서 localStorage도 처리)
        logout();

        // 성공 알림 후 메인 페이지로 이동
        alert("계정이 성공적으로 탈퇴되었습니다.");
        router.replace("/");
      } else {
        setError(data?.deleteAccount?.message || "계정 탈퇴에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "계정 탈퇴 중 오류가 발생했습니다.");
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmText("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            계정 탈퇴
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            계정을 탈퇴하면 모든 데이터가 영구적으로 삭제되며 복구할 수
            없습니다.
            <br />
            정말로 계정을 탈퇴하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호 확인
            </label>
            <Input
              id="password"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmText"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              확인 문구 입력
            </label>
            <Input
              id="confirmText"
              type="text"
              placeholder="'계정 탈퇴'를 입력하세요"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              계속하려면 위 입력란에 <strong>&apos;계정 탈퇴&apos;</strong>를
              정확히 입력하세요.
            </p>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              disabled={loading || confirmText !== "계정 탈퇴"}
            >
              {loading ? "처리 중..." : "계정 탈퇴"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
