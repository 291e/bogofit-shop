/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { usePublicProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProductInquiries, useAnswerProductInquiry } from "@/hooks/useProductInquiries";
import { ProductInquiry } from "@/types/productInquiry";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/providers/languageProvider";
import { useBrandContext } from "../../layout";

export default function BrandProductInquiriesPage() {
    const { t } = useLanguage();
    const { brandId } = useBrandContext();

    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const [selectedProduct, setSelectedProduct] = React.useState<any | undefined>(undefined);
    const [selectedInquiryForAnswer, setSelectedInquiryForAnswer] = React.useState<ProductInquiry | null>(null);

    // Use includeInquiryStats=true to get inquiry stats from Product API
    const { data, isLoading, error } = usePublicProducts({
        pageNumber: page,
        pageSize: 10,
        brandId,
        enabled: !!brandId,
        isActive: true,
        searchKeyword: search || undefined,
        inquiries: true, // ✅ Include inquiry stats in product response
    } as any);

    const raw = data?.data?.data || data?.products || [];
    const totalPages = data?.data?.totalPages || data?.pagination?.totalPages || data?.totalPages || 1;

    // Filter products that might have inquiries
    const filtered = raw.filter((p: any) => p.id);

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">{t("header.business.brandDetail.products.inquiries.title")}</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder={t("header.business.brandDetail.products.inquiries.searchPlaceholder")}
                        value={search}
                        onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                        className="w-56"
                    />
                    <Button variant="outline" onClick={() => { setSearch(""); setPage(1); }}>{t("header.business.brandDetail.products.inquiries.reset")}</Button>
                </div>
            </div>

            {error && (
                <div className="text-red-600">{t("header.business.brandDetail.products.inquiries.loadFailed")}</div>
            )}

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="p-3 text-left">{t("header.business.brandDetail.products.inquiries.product")}</th>
                            <th className="p-3 text-right">{t("header.business.brandDetail.products.inquiries.inquiryCount")}</th>
                            <th className="p-3 text-right">{t("header.business.brandDetail.products.inquiries.unanswered")}</th>
                            <th className="p-3 text-right">{t("header.business.brandDetail.products.inquiries.answered")}</th>
                            <th className="p-3 text-right">{t("header.business.brandDetail.products.inquiries.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td className="p-4" colSpan={5}>{t("header.business.brandDetail.products.inquiries.loading")}</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td className="p-6 text-center text-gray-500" colSpan={5}>{t("header.business.brandDetail.products.inquiries.noProductData")}</td></tr>
                        ) : (
                            filtered.map((p: any) => (
                                <ProductInquiryRow
                                    key={p.id}
                                    product={p}
                                    onViewInquiries={() => setSelectedProduct(p)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((x) => x - 1)}>{t("header.business.brandDetail.products.inquiries.previous")}</Button>
                <div className="text-sm text-gray-600 px-2 py-1">{page} / {totalPages}</div>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((x) => x + 1)}>{t("header.business.brandDetail.products.inquiries.next")}</Button>
            </div>

            {/* Quick view modal for product inquiries */}
            <ProductInquiriesQuickModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(undefined as any)}
                onAnswerInquiry={(inquiry) => setSelectedInquiryForAnswer(inquiry)}
            />

            {/* Answer Inquiry Modal - rendered outside to avoid nested modals */}
            {selectedInquiryForAnswer && (
                <AnswerInquiryModal
                    inquiry={selectedInquiryForAnswer}
                    onClose={() => {
                        setSelectedInquiryForAnswer(null);
                        // Refresh inquiries if product modal is still open
                        if (selectedProduct) {
                            // The ProductInquiriesQuickModal will handle refresh
                        }
                    }}
                />
            )}
        </div>
    );
}

function ProductInquiryRow({
    product,
    onViewInquiries
}: {
    product: any,
    onViewInquiries: () => void
}) {
    const { t } = useLanguage();
    // Get inquiry stats from product response (when includeInquiryStats=true)
    const inquiryStats = product.inquiryStats || {
        totalInquiries: 0,
        pendingInquiries: 0,
        answeredInquiries: 0,
        hiddenInquiries: 0
    };

    return (
        <tr className="border-t hover:bg-gray-50">
            <td className="p-3">
                <div className="flex items-center gap-3">
                    <img src={product.images?.[0] || product.thumbUrl || "/logo.png"} alt={product.name} className="w-10 h-10 object-cover rounded" />
                    <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.brand?.name}</div>
                    </div>
                </div>
            </td>
            <td className="p-3 text-right">
                {inquiryStats.totalInquiries > 0 ? inquiryStats.totalInquiries : <span className="text-gray-400">0</span>}
            </td>
            <td className="p-3 text-right">
                {inquiryStats.pendingInquiries > 0 ? (
                    <span className="text-red-600 font-medium">{inquiryStats.pendingInquiries}</span>
                ) : (
                    <span className="text-gray-400">0</span>
                )}
            </td>
            <td className="p-3 text-right">
                {inquiryStats.answeredInquiries > 0 ? (
                    <span className="text-green-600 font-medium">{inquiryStats.answeredInquiries}</span>
                ) : (
                    <span className="text-gray-400">0</span>
                )}
            </td>
            <td className="p-3 text-right">
                <Button variant="outline" size="sm" onClick={onViewInquiries}>{t("header.business.brandDetail.products.inquiries.viewInquiries")}</Button>
            </td>
        </tr>
    );
}

function ProductInquiriesQuickModal({
    product,
    onClose,
    onAnswerInquiry
}: {
    product?: any,
    onClose: () => void,
    onAnswerInquiry: (inquiry: ProductInquiry) => void
}) {
    const { t } = useLanguage();
    const open = !!product;
    const productId = product?.id;
    const queryClient = useQueryClient();
    const [page, setPage] = React.useState(1);

    // Reset page to 1 when product changes
    React.useEffect(() => {
        if (productId) {
            setPage(1);
        }
    }, [productId]);

    const { data: inquiriesData, isLoading } = useProductInquiries(productId || '', { page, pageSize: 10 });

    const inquiries = inquiriesData?.inquiries || [];
    const pagination = inquiriesData?.pagination;

    // Debug: Log to see what data we're getting
    React.useEffect(() => {
        if (inquiriesData && productId) {
            console.log('🔍 Modal inquiries data:', {
                productId,
                page,
                inquiries: inquiries,
                totalInquiries: inquiries.length,
                pagination: pagination,
                totalCount: pagination?.totalCount,
                inquiriesList: inquiries.map((i: ProductInquiry) => ({
                    id: i.id,
                    status: i.status,
                    isSecret: i.isSecret,
                    question: i.question.substring(0, 50) + '...'
                })),
                rawData: inquiriesData
            });
        }
    }, [inquiriesData, inquiries, pagination, productId, page]);

    // Refresh inquiries when answer modal closes
    React.useEffect(() => {
        if (productId) {
            queryClient.invalidateQueries({ queryKey: ["product-inquiries", "product", productId] });
        }
    }, [productId, queryClient]);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t("header.business.brandDetail.products.inquiries.modalTitle", { productName: product?.name })}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto space-y-4">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">{t("header.business.brandDetail.products.inquiries.loading")}</div>
                    ) : inquiries.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">{t("header.business.brandDetail.products.inquiries.noInquiries")}</div>
                    ) : (
                        <div className="space-y-4">
                            {inquiries.map((inquiry: ProductInquiry) => (
                                <div key={inquiry.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium text-gray-900">{inquiry.user.name}</span>
                                                {inquiry.isSecret && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{t("header.business.brandDetail.products.inquiries.private")}</span>
                                                )}
                                                {inquiry.status === 'pending' && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{t("header.business.brandDetail.products.inquiries.unanswered")}</span>
                                                )}
                                                {inquiry.status === 'answered' && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{t("header.business.brandDetail.products.inquiries.answered")}</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(inquiry.createdAt).toLocaleString('ko-KR')}
                                            </div>
                                        </div>
                                        {inquiry.status === 'pending' && (
                                            <Button size="sm" onClick={() => onAnswerInquiry(inquiry)}>
                                                {t("header.business.brandDetail.products.inquiries.answer")}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <div className="text-sm font-medium text-gray-700 mb-1">Q:</div>
                                        <div className="text-sm text-gray-600 whitespace-pre-wrap">{inquiry.question}</div>
                                    </div>
                                    {inquiry.answer ? (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="text-sm font-medium text-purple-600 mb-1">A:</div>
                                            <div className="text-sm text-gray-600 whitespace-pre-wrap">{inquiry.answer}</div>
                                            {(inquiry.answeredByUser || inquiry.answeredAt) && (
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {inquiry.answeredByUser && (
                                                        <span>{t("header.business.brandDetail.products.inquiries.seller")} {inquiry.answeredByUser.name}</span>
                                                    )}
                                                    {inquiry.answeredByUser && inquiry.answeredAt && <span> • </span>}
                                                    {inquiry.answeredAt && (
                                                        <span>{t("header.business.brandDetail.products.inquiries.answerDate")} {new Date(inquiry.answeredAt).toLocaleString('ko-KR')}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        inquiry.status === 'pending' && (
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-sm text-gray-500 italic">
                                                    {t("header.business.brandDetail.products.inquiries.waitingForAnswer")}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((x) => x - 1)}>{t("header.business.brandDetail.products.inquiries.previous")}</Button>
                        <div className="text-sm text-gray-600 px-2 py-1">{page} / {pagination.totalPages}</div>
                        <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((x) => x + 1)}>{t("header.business.brandDetail.products.inquiries.next")}</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function AnswerInquiryModal({ inquiry, onClose }: { inquiry: ProductInquiry, onClose: () => void }) {
    const { t } = useLanguage();
    const [answer, setAnswer] = React.useState("");
    const answerMutation = useAnswerProductInquiry();
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (answer.length < 10 || answer.length > 2000) {
            alert(t("header.business.brandDetail.products.inquiries.validationError"));
            return;
        }

        try {
            await answerMutation.mutateAsync({
                inquiryId: inquiry.id,
                data: { answer }
            });
            setAnswer("");
            // Refresh inquiries list
            queryClient.invalidateQueries({ queryKey: ["product-inquiries", "product", inquiry.productId] });
            onClose();
        } catch (error) {
            console.error('Error answering inquiry:', error);
            // Don't close on error
        }
    };

    return (
        <Dialog open={!!inquiry} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("header.business.brandDetail.products.inquiries.answerModalTitle")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">{t("header.business.brandDetail.products.inquiries.question")}</div>
                        <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700 whitespace-pre-wrap">
                            {inquiry.question}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">{t("header.business.brandDetail.products.inquiries.answerLabel")}</label>
                        <Textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={t("header.business.brandDetail.products.inquiries.answerPlaceholder")}
                            rows={6}
                            required
                            minLength={10}
                            maxLength={2000}
                            className="resize-none"
                        />
                        <div className="text-xs text-gray-500 mt-1">{t("header.business.brandDetail.products.inquiries.characters", { count: answer.length })}</div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>{t("header.business.brandDetail.products.inquiries.cancel")}</Button>
                        <Button type="submit" disabled={answerMutation.isPending || answer.length < 10}>
                            {answerMutation.isPending ? t("header.business.brandDetail.products.inquiries.registering") : t("header.business.brandDetail.products.inquiries.registerAnswer")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

