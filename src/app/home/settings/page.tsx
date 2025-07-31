"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Settings, 
  Store, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Camera,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [storeInfo, setStoreInfo] = useState({
    name: "My Awesome Shop",
    description: "최고의 쇼핑 경험을 제공하는 온라인 스토어입니다.",
    email: "contact@myshop.com",
    phone: "02-1234-5678",
    address: "서울특별시 강남구 테헤란로 123",
    website: "https://myshop.com",
    logo: "/logo/bogofit logo.png"
  });

  const [userSettings, setUserSettings] = useState({
    name: "관리자",
    email: "admin@myshop.com",
    phone: "010-1234-5678",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderNotifications: true,
    productNotifications: true,
    customerNotifications: true,
    marketingNotifications: false
  });

  const [systemSettings, setSystemSettings] = useState({
    language: "ko",
    timezone: "Asia/Seoul",
    currency: "KRW",
    dateFormat: "YYYY-MM-DD",
    theme: "light"
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAttempts: 5,
    passwordExpiry: 90
  });

  const handleStoreInfoChange = (field: string, value: string) => {
    setStoreInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserSettingsChange = (field: string, value: string) => {
    setUserSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSystemSettingsChange = (field: string, value: string) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecuritySettingsChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings:`, {
      storeInfo,
      userSettings,
      notifications,
      systemSettings,
      securitySettings
    });
    alert(`${section} 설정이 저장되었습니다!`);
  };

  const tabs = [
    { id: "store", label: "스토어 정보", icon: Store },
    { id: "user", label: "사용자 설정", icon: User },
    { id: "notifications", label: "알림 설정", icon: Bell },
    { id: "system", label: "시스템 설정", icon: Settings },
    { id: "security", label: "보안 설정", icon: Shield }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="text-sm text-gray-600">시스템 및 계정 설정을 관리하세요</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Store Information */}
          {activeTab === "store" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  스토어 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <Label>스토어 로고</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={storeInfo.logo} alt="Store Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        로고 변경
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeName">스토어 이름 *</Label>
                    <Input
                      id="storeName"
                      value={storeInfo.name}
                      onChange={(e) => handleStoreInfoChange("name", e.target.value)}
                      placeholder="스토어 이름을 입력하세요"
                    />
                  </div>

                  <div>
                    <Label htmlFor="storeEmail">이메일 *</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={storeInfo.email}
                      onChange={(e) => handleStoreInfoChange("email", e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="storePhone">전화번호</Label>
                    <Input
                      id="storePhone"
                      value={storeInfo.phone}
                      onChange={(e) => handleStoreInfoChange("phone", e.target.value)}
                      placeholder="02-1234-5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="storeWebsite">웹사이트</Label>
                    <Input
                      id="storeWebsite"
                      type="url"
                      value={storeInfo.website}
                      onChange={(e) => handleStoreInfoChange("website", e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeAddress">주소</Label>
                  <Input
                    id="storeAddress"
                    value={storeInfo.address}
                    onChange={(e) => handleStoreInfoChange("address", e.target.value)}
                    placeholder="스토어 주소를 입력하세요"
                  />
                </div>

                <div>
                  <Label htmlFor="storeDescription">스토어 설명</Label>
                  <Textarea
                    id="storeDescription"
                    value={storeInfo.description}
                    onChange={(e) => handleStoreInfoChange("description", e.target.value)}
                    placeholder="스토어에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("스토어 정보")} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Settings */}
          {activeTab === "user" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  사용자 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName">이름 *</Label>
                    <Input
                      id="userName"
                      value={userSettings.name}
                      onChange={(e) => handleUserSettingsChange("name", e.target.value)}
                      placeholder="사용자 이름"
                    />
                  </div>

                  <div>
                    <Label htmlFor="userEmail">이메일 *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={userSettings.email}
                      onChange={(e) => handleUserSettingsChange("email", e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="userPhone">전화번호</Label>
                    <Input
                      id="userPhone"
                      value={userSettings.phone}
                      onChange={(e) => handleUserSettingsChange("phone", e.target.value)}
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">비밀번호 변경</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">현재 비밀번호</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={userSettings.currentPassword}
                          onChange={(e) => handleUserSettingsChange("currentPassword", e.target.value)}
                          placeholder="현재 비밀번호를 입력하세요"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword">새 비밀번호</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={userSettings.newPassword}
                          onChange={(e) => handleUserSettingsChange("newPassword", e.target.value)}
                          placeholder="새 비밀번호를 입력하세요"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={userSettings.confirmPassword}
                        onChange={(e) => handleUserSettingsChange("confirmPassword", e.target.value)}
                        placeholder="새 비밀번호를 다시 입력하세요"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("사용자 설정")} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  알림 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">이메일 알림</h3>
                      <p className="text-sm text-gray-600">중요한 업데이트를 이메일로 받습니다</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => handleNotificationChange("emailNotifications", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">주문 알림</h3>
                      <p className="text-sm text-gray-600">새로운 주문이 들어올 때 알림을 받습니다</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.orderNotifications}
                      onChange={(e) => handleNotificationChange("orderNotifications", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">상품 알림</h3>
                      <p className="text-sm text-gray-600">재고 부족이나 상품 업데이트 알림</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.productNotifications}
                      onChange={(e) => handleNotificationChange("productNotifications", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">고객 알림</h3>
                      <p className="text-sm text-gray-600">고객 문의나 리뷰 알림</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.customerNotifications}
                      onChange={(e) => handleNotificationChange("customerNotifications", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">마케팅 알림</h3>
                      <p className="text-sm text-gray-600">프로모션 및 마케팅 관련 알림</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.marketingNotifications}
                      onChange={(e) => handleNotificationChange("marketingNotifications", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("알림 설정")} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Settings */}
          {activeTab === "system" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  시스템 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">언어</Label>
                    <select
                      id="language"
                      value={systemSettings.language}
                      onChange={(e) => handleSystemSettingsChange("language", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    >
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">시간대</Label>
                    <select
                      id="timezone"
                      value={systemSettings.timezone}
                      onChange={(e) => handleSystemSettingsChange("timezone", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    >
                      <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                      <option value="America/New_York">America/New_York (UTC-5)</option>
                      <option value="Europe/London">Europe/London (UTC+0)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="currency">통화</Label>
                    <select
                      id="currency"
                      value={systemSettings.currency}
                      onChange={(e) => handleSystemSettingsChange("currency", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    >
                      <option value="KRW">KRW (₩)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="dateFormat">날짜 형식</Label>
                    <select
                      id="dateFormat"
                      value={systemSettings.dateFormat}
                      onChange={(e) => handleSystemSettingsChange("dateFormat", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="theme">테마</Label>
                    <select
                      id="theme"
                      value={systemSettings.theme}
                      onChange={(e) => handleSystemSettingsChange("theme", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    >
                      <option value="light">라이트 모드</option>
                      <option value="dark">다크 모드</option>
                      <option value="auto">자동</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("시스템 설정")} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  보안 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">2단계 인증</h3>
                      <p className="text-sm text-gray-600">로그인 시 추가 보안을 위해 2단계 인증을 활성화합니다</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => handleSecuritySettingsChange("twoFactorAuth", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>

                  <div className="p-4 border rounded-lg">
                    <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
                    <select
                      id="sessionTimeout"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecuritySettingsChange("sessionTimeout", parseInt(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    >
                      <option value={15}>15분</option>
                      <option value={30}>30분</option>
                      <option value={60}>1시간</option>
                      <option value={120}>2시간</option>
                    </select>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <Label htmlFor="loginAttempts">최대 로그인 시도 횟수</Label>
                    <select
                      id="loginAttempts"
                      value={securitySettings.loginAttempts}
                      onChange={(e) => handleSecuritySettingsChange("loginAttempts", parseInt(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    >
                      <option value={3}>3회</option>
                      <option value={5}>5회</option>
                      <option value={10}>10회</option>
                    </select>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <Label htmlFor="passwordExpiry">비밀번호 만료 기간 (일)</Label>
                    <select
                      id="passwordExpiry"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => handleSecuritySettingsChange("passwordExpiry", parseInt(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    >
                      <option value={30}>30일</option>
                      <option value={60}>60일</option>
                      <option value={90}>90일</option>
                      <option value={180}>180일</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("보안 설정")} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
