"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";
import { Camera, Mail, Phone, User as UserIcon, Lock } from "lucide-react";

export default function ProfileSection() {
  const { user, updateName, updateEmail, updatePhone, updatePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveBasicInfo = async () => {
    try {
      // Update only changed fields
      if (name !== user?.name && name.trim()) {
        await updateName({ name });
      }
      if (email !== user?.email && email.trim()) {
        await updateEmail({ email });
      }
      if (phone !== user?.phone && phone.trim()) {
        await updatePhone({ phone });
      }
      setIsEditing(false);
    } catch {
      // Error toast handled by AuthProvider
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setIsEditing(false);
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다");
      return;
    }
    try {
      await updatePassword({ currentPassword, newPassword });
      setIsEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // Error toast handled by AuthProvider
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원 정보</CardTitle>
        <CardDescription>프로필 정보를 관리하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 프로필 이미지 */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" alt={user?.name} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-pink-600 transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.userId}</p>
          </div>
        </div>

        <Separator />

        {/* 기본 정보 */}
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    이름
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    이메일
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    전화번호
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveBasicInfo}>저장</Button>
                <Button variant="outline" onClick={handleCancelEdit}>취소</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500 w-20">이름</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500 w-20">이메일</span>
                    <span className="font-medium">{user?.email || "이메일을 등록해주세요"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500 w-20">전화번호</span>
                    <span className="font-medium">{user?.phone || "전화번호를 등록해주세요"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                  정보 수정
                </Button>
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* 비밀번호 변경 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <h3 className="font-semibold">비밀번호</h3>
          </div>

          {isEditingPassword ? (
            <>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">현재 비밀번호</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 (8자 이상)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 확인"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdatePassword}>비밀번호 변경</Button>
                <Button variant="outline" onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setIsEditingPassword(false);
                }}>
                  취소
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-2">
              <span className="font-medium">••••••••</span>
              <Button variant="outline" size="sm" onClick={() => setIsEditingPassword(true)}>
                변경
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

