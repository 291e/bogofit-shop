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
import { useLanguage } from "@/providers/languageProvider";

export default function ProfileSection() {
  const { t } = useLanguage();
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
      toast.error(t("myPage.profile.allFieldsRequired"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("myPage.profile.passwordMismatch"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("myPage.profile.passwordMinLength"));
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
        <CardTitle>{t("myPage.profile.title")}</CardTitle>
        <CardDescription>{t("myPage.profile.description")}</CardDescription>
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
                    {t("myPage.profile.name")}
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("myPage.profile.namePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t("myPage.profile.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("myPage.profile.emailPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t("myPage.profile.phone")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("myPage.profile.phonePlaceholder")}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveBasicInfo}>{t("myPage.profile.save")}</Button>
                <Button variant="outline" onClick={handleCancelEdit}>{t("myPage.profile.cancel")}</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500 w-20">{t("myPage.profile.name")}</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500 w-20">{t("myPage.profile.email")}</span>
                    <span className="font-medium">{user?.email || t("myPage.profile.emailNotRegistered")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500 w-20">{t("myPage.profile.phone")}</span>
                    <span className="font-medium">{user?.phone || t("myPage.profile.phoneNotRegistered")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                  {t("myPage.profile.edit")}
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
            <h3 className="font-semibold">{t("myPage.profile.password")}</h3>
          </div>

          {isEditingPassword ? (
            <>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("myPage.profile.currentPassword")}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("myPage.profile.currentPasswordPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("myPage.profile.newPassword")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("myPage.profile.newPasswordPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("myPage.profile.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("myPage.profile.confirmPasswordPlaceholder")}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdatePassword}>{t("myPage.profile.changePassword")}</Button>
                <Button variant="outline" onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setIsEditingPassword(false);
                }}>
                  {t("myPage.profile.cancel")}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-2">
              <span className="font-medium">••••••••</span>
              <Button variant="outline" size="sm" onClick={() => setIsEditingPassword(true)}>
                {t("myPage.profile.change")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

