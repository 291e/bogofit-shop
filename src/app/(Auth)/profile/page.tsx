"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { EDIT_PROFILE } from "@/graphql/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import DeleteAccountModal from "@/components/auth/DeleteAccountModal";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setProfile(user.profile || "");
    }
  }, [user]);

  const [editProfile, { loading: mutationLoading }] = useMutation(
    EDIT_PROFILE,
    {
      onCompleted: (data) => {
        if (data?.editProfile?.success) {
          setSuccess("프로필이 성공적으로 업데이트되었습니다.");
          setPassword("");
        } else {
          setError(
            data?.editProfile?.message || "프로필 업데이트에 실패했습니다."
          );
        }
      },
      onError: (err) => {
        setError(err.message || "프로필 업데이트 중 오류가 발생했습니다.");
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) {
      setError("변경을 위해 비밀번호를 입력해주세요.");
      return;
    }

    editProfile({
      variables: {
        email,
        profile,
        password,
      },
    });
  };

  // 로그인 상태 확인
  useEffect(() => {
    setLoading(true);
    if (!isAuthenticated) {
      router.replace("/login");
    }
    setLoading(false);
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">내 프로필</h1>

        <div className="mb-6">
          <div className="text-gray-600 mb-1">아이디</div>
          <div className="font-medium">{user?.userId}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이메일
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
            />
          </div>

          <div>
            <label
              htmlFor="profile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              프로필 이미지 URL
            </label>
            <Input
              id="profile"
              type="text"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              placeholder="프로필 이미지 URL"
            />
          </div>

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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="변경을 위한 비밀번호 입력"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm text-center">{success}</div>
          )}

          <Button type="submit" className="w-full" disabled={mutationLoading}>
            {mutationLoading ? "업데이트 중..." : "프로필 업데이트"}
          </Button>
        </form>

        {/* 계정 탈퇴 섹션 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">위험 구역</h3>
          <p className="text-sm text-gray-600 mb-4">
            계정을 탈퇴하면 모든 데이터가 영구적으로 삭제되며 복구할 수
            없습니다.
          </p>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            className="w-full"
          >
            계정 탈퇴
          </Button>
        </div>
      </div>

      {/* 계정 탈퇴 모달 */}
      {user && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          userId={user.userId}
        />
      )}
    </div>
  );
}
