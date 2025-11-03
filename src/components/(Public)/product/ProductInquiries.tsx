"use client";

import React, { useState } from 'react';
import { ProductInquiryQueryParams } from '@/types/productInquiry';
import { useProductInquiries, useCreateProductInquiry } from '@/hooks/useProductInquiries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MessageSquare, Lock, User, Calendar } from 'lucide-react';
import { useAuth } from '@/providers/authProvider';
import { ProductInquiry } from '@/types/productInquiry';
import { toast } from 'sonner';

interface ProductInquiriesProps {
    productId: string;
    fetchList?: boolean;
}

export const ProductInquiries: React.FC<ProductInquiriesProps> = ({
    productId,
    fetchList = true,
}) => {
    const { isAuthenticated, user } = useAuth();
    const [queryParams, setQueryParams] = useState<ProductInquiryQueryParams>({
        page: 1,
        pageSize: 10,
    });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSectionOpen, setIsSectionOpen] = useState(true); // Collapsible section state
    const [question, setQuestion] = useState('');
    const [isSecret, setIsSecret] = useState(false);

    const { data: inquiriesData, isLoading: inquiriesLoading, error } = useProductInquiries(productId, queryParams);
    const createMutation = useCreateProductInquiry();

    const handlePageChange = (page: number) => {
        setQueryParams(prev => ({ ...prev, page }));
    };

    const handleCreateInquiry = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('로그인이 필요합니다');
            return;
        }

        if (question.length < 10 || question.length > 2000) {
            toast.error('질문은 10자 이상 2000자 이하여야 합니다');
            return;
        }

        try {
            await createMutation.mutateAsync({
                productId,
                question,
                isSecret
            });
            setQuestion('');
            setIsSecret(false);
            setShowCreateForm(false);
        } catch {
            // Error is handled by mutation onError
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (fetchList && inquiriesLoading) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">문의 정보를 불러오는 중...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (fetchList && error) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="text-center">
                        <p className="text-red-600">문의를 불러오는데 실패했습니다.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const inquiries = fetchList ? (inquiriesData?.inquiries || []) : [];
    const pagination = fetchList ? inquiriesData?.pagination : undefined;

    return (
        <div className="space-y-6">
            {/* Header - Collapsible */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsSectionOpen(!isSectionOpen)}
                            className="flex items-center gap-2 text-gray-800 hover:text-pink-600 transition-colors"
                        >
                            <MessageSquare className="w-5 h-5 text-pink-600" />
                            <CardTitle className="text-xl font-bold">
                                상품 문의
                            </CardTitle>
                            {pagination && pagination.totalCount > 0 && (
                                <span className="text-sm text-gray-500 font-normal">
                                    ({pagination.totalCount})
                                </span>
                            )}
                            {isSectionOpen ? (
                                <ChevronUp className="w-5 h-5 ml-2" />
                            ) : (
                                <ChevronDown className="w-5 h-5 ml-2" />
                            )}
                        </button>
                        {isAuthenticated && (
                            <Button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                variant="outline"
                                size="sm"
                            >
                                {showCreateForm ? '취소' : '문의하기'}
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Create Form - Only show when section is open */}
            {showCreateForm && isAuthenticated && isSectionOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">새 문의 작성</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateInquiry} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="question">문의 내용</Label>
                                <Textarea
                                    id="question"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="문의 내용을 입력하세요 (최소 10자 이상)"
                                    rows={5}
                                    required
                                    minLength={10}
                                    maxLength={2000}
                                    className="resize-none"
                                />
                                <p className="text-sm text-gray-500">
                                    {question.length} / 2000자
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isSecret"
                                    checked={isSecret}
                                    onCheckedChange={(checked) => setIsSecret(checked as boolean)}
                                />
                                <Label
                                    htmlFor="isSecret"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    비공개 문의 (판매자와 나만 볼 수 있습니다)
                                </Label>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || question.length < 10}
                                    className="flex-1"
                                >
                                    {createMutation.isPending ? '등록 중...' : '문의 등록'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setQuestion('');
                                        setIsSecret(false);
                                    }}
                                >
                                    취소
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {!isAuthenticated && (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-gray-600 mb-4">
                                문의를 작성하려면 로그인이 필요합니다.
                            </p>
                            <Button
                                onClick={() => {
                                    window.location.href = '/login';
                                }}
                                variant="outline"
                            >
                                로그인하기
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Inquiries List - Only show when section is open */}
            {fetchList && isSectionOpen && (
                <Card>
                    <CardContent className="pt-6">
                        {/* Inquiries List */}
                        {inquiries.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">💬</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    아직 등록된 문의가 없습니다
                                </h3>
                                <p className="text-gray-600">
                                    첫 번째 문의를 작성해보세요.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {inquiries.map((inquiry: ProductInquiry) => (
                                    <Card
                                        key={inquiry.id}
                                        className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
                                    >
                                        <CardContent className="p-6">
                                            {/* Inquiry Header */}
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold text-lg">
                                                        {inquiry.user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium text-gray-900 text-lg">
                                                            {inquiry.user.name}
                                                        </span>
                                                        {inquiry.isSecret && (
                                                            <Badge variant="secondary" className="text-xs bg-gray-100">
                                                                <Lock className="w-3 h-3 mr-1" />
                                                                비공개
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(inquiry.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Question */}
                                            <div className="mb-4">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <span className="font-bold text-pink-600 text-lg">Q:</span>
                                                    {inquiry.isSecret && user?.id !== inquiry.userId ? (
                                                        <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <p className="text-gray-500 italic text-sm flex items-center gap-2">
                                                                <Lock className="w-4 h-4" />
                                                                비공개 문의입니다. 문의 작성자와 판매자만 볼 수 있습니다.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-700 leading-relaxed text-base break-words whitespace-pre-wrap flex-1">
                                                            {inquiry.question}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Answer */}
                                            {inquiry.answer ? (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    {inquiry.isSecret && user?.id !== inquiry.userId ? (
                                                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <p className="text-gray-500 italic text-sm flex items-center gap-2">
                                                                <Lock className="w-4 h-4" />
                                                                비공개 문의의 답변입니다. 문의 작성자와 판매자만 볼 수 있습니다.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-start gap-2 mb-2">
                                                                <span className="font-bold text-purple-600 text-lg">A:</span>
                                                                <p className="text-gray-700 leading-relaxed text-base break-words whitespace-pre-wrap flex-1">
                                                                    {inquiry.answer}
                                                                </p>
                                                            </div>
                                                            {(inquiry.answeredByUser || inquiry.answeredAt) && (
                                                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                                                    {inquiry.answeredByUser && (
                                                                        <>
                                                                            <User className="w-4 h-4" />
                                                                            <span>판매자: {inquiry.answeredByUser.name}</span>
                                                                            {inquiry.answeredAt && <span className="text-gray-300">•</span>}
                                                                        </>
                                                                    )}
                                                                    {inquiry.answeredAt && (
                                                                        <>
                                                                            <Calendar className="w-4 h-4" />
                                                                            <span>{formatDate(inquiry.answeredAt)}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ) : null}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(queryParams.page! - 1)}
                                    disabled={queryParams.page === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    이전
                                </Button>

                                <div className="flex items-center gap-1">
                                    {(() => {
                                        const totalPages = pagination.totalPages;
                                        const currentPage = queryParams.page || 1;
                                        const pages: number[] = [];

                                        // Show up to 5 pages around current page
                                        if (totalPages <= 5) {
                                            // Show all pages if total <= 5
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        } else {
                                            // Show pages around current page
                                            if (currentPage <= 3) {
                                                // Near the beginning
                                                for (let i = 1; i <= 5; i++) {
                                                    pages.push(i);
                                                }
                                            } else if (currentPage >= totalPages - 2) {
                                                // Near the end
                                                for (let i = totalPages - 4; i <= totalPages; i++) {
                                                    pages.push(i);
                                                }
                                            } else {
                                                // In the middle
                                                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                                                    pages.push(i);
                                                }
                                            }
                                        }

                                        return pages.map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {page}
                                            </Button>
                                        ));
                                    })()}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(queryParams.page! + 1)}
                                    disabled={queryParams.page === pagination.totalPages}
                                >
                                    다음
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

