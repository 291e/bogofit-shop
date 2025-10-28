"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, Filter, Plus } from "lucide-react";

interface FAQSubSectionProps {
    brandId: string;
}

export default function FAQSubSection({ }: FAQSubSectionProps) {
    // const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        console.log("Searching FAQ...");
        // TODO: Implement search functionality
    };

    const handleFilter = () => {
        console.log("Applying filters...");
        // TODO: Implement filter functionality
    };

    const handleCreate = () => {
        console.log("Creating new FAQ...");
        // TODO: Implement create functionality
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <HelpCircle className="h-6 w-6 text-orange-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">질문과답변</h1>
                                <p className="text-sm text-gray-600">자주 묻는 질문을 확인하고 관리하세요</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleFilter}>
                                <Filter className="h-4 w-4 mr-2" />
                                필터
                            </Button>
                            <Button onClick={handleCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                FAQ 작성
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="FAQ 검색..."
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
                                <CardTitle className="text-sm font-medium">전체 FAQ</CardTitle>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">48개</div>
                                <p className="text-xs text-muted-foreground">총 FAQ</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">인기 FAQ</CardTitle>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12개</div>
                                <p className="text-xs text-muted-foreground">조회수 높음</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">최근 FAQ</CardTitle>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">5일 전</div>
                                <p className="text-xs text-muted-foreground">마지막 업데이트</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Development Notice */}
                    <div className="border rounded-lg p-8 text-center">
                        <div className="text-6xl mb-4">🚧</div>
                        <h2 className="text-2xl font-bold mb-4">질문과답변 기능 개발 중</h2>
                        <p className="text-gray-600 mb-6">
                            이 기능은 현재 개발 중입니다. 곧 사용하실 수 있습니다.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h3 className="font-semibold text-orange-800 mb-2">예정 기능:</h3>
                            <ul className="text-left text-orange-700 space-y-1">
                                <li>• FAQ 목록 조회</li>
                                <li>• FAQ 작성 및 수정</li>
                                <li>• 카테고리별 분류</li>
                                <li>• FAQ 검색 및 필터링</li>
                                <li>• 조회수 및 인기도 추적</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}