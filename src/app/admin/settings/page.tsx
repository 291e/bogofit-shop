"use client";

import { Settings as SettingsIcon, Bell, Shield, Database, Mail } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">설정</h1>
                <p className="text-gray-600 mt-2">시스템 설정을 관리하세요</p>
            </div>

            {/* Placeholder */}
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <SettingsIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">설정 기능 개발 중</h2>
                    <p className="text-gray-600 mb-8">
                        시스템 설정, 알림 관리, 보안 설정 등 다양한 설정 기능이 곧 제공될 예정입니다.
                    </p>

                    {/* Preview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">알림 설정</p>
                        </div>
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <Shield className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">보안 설정</p>
                        </div>
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <Database className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">데이터 관리</p>
                        </div>
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <Mail className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">이메일 설정</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
