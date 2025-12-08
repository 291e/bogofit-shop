"use client";

import { Bell, LogOut, User as UserIcon, Settings, Search } from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

export default function AdminHeader() {
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                {/* Title */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">관리자 대시보드</h2>
                    <p className="text-sm text-gray-500 mt-1">BOGOFIT 시스템 관리</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Search Bar - Optional */}
                    <div className="hidden md:flex items-center relative">
                        <Search className="w-4 h-4 absolute left-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="검색..."
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="hidden md:block text-right">
                            <div className="text-sm font-medium text-gray-900">
                                {mounted && user?.name ? user.name : "Admin"}
                            </div>
                            <div className="text-xs text-gray-500">
                                {mounted && user?.email ? user.email : "admin@bogofit.kr"}
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                        <AvatarImage src={undefined} alt={user?.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                            {mounted && user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {mounted && user?.name ? user.name : "Admin"}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {mounted && user?.email ? user.email : "admin@bogofit.kr"}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>프로필</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>설정</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>로그아웃</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
