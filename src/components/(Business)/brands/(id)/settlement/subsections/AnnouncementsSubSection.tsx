"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Megaphone, Filter, Plus } from "lucide-react";

interface AnnouncementsSubSectionProps {
    brandId: string;
}

export default function AnnouncementsSubSection({ }: AnnouncementsSubSectionProps) {
    // const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        console.log("Searching announcements...");
        // TODO: Implement search functionality
    };

    const handleFilter = () => {
        console.log("Applying filters...");
        // TODO: Implement filter functionality
    };

    const handleCreate = () => {
        console.log("Creating new announcement...");
        // TODO: Implement create functionality
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Megaphone className="h-6 w-6 text-purple-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">공지사항</h1>
                                <p className="text-sm text-gray-600">중요한 공지사항을 확인하고 관리하세요</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleFilter}>
                                <Filter className="h-4 w-4 mr-2" />
                                필터
                            </Button>
                            <Button onClick={handleCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                공지 작성
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="공지사항 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" onClick={handleSearch}>
                            검색
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">전체 공지</CardTitle>
                                <Megaphone className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">24개</div>
                                <p className="text-xs text-muted-foreground">총 공지사항</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">중요 공지</CardTitle>
                                <Megaphone className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">3개</div>
                                <p className="text-xs text-muted-foreground">중요도 높음</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">최근 공지</CardTitle>
                                <Megaphone className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">2일 전</div>
                                <p className="text-xs text-muted-foreground">마지막 업데이트</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Development Notice */}
                    <div className="border rounded-lg p-8 text-center">
                        <div className="text-6xl mb-4">🚧</div>
                        <h2 className="text-2xl font-bold mb-4">공지사항 기능 개발 중</h2>
                        <p className="text-gray-600 mb-6">
                            이 기능은 현재 개발 중입니다. 곧 사용하실 수 있습니다.
                        </p>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h3 className="font-semibold text-purple-800 mb-2">예정 기능:</h3>
                            <ul className="text-left text-purple-700 space-y-1">
                                <li>• 공지사항 목록 조회</li>
                                <li>• 공지사항 작성 및 수정</li>
                                <li>• 중요도 설정</li>
                                <li>• 공지사항 검색 및 필터링</li>
                                <li>• 공지사항 알림 기능</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}