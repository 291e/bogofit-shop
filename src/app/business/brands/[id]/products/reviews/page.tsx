/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { usePublicProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

export default function BrandProductReviewsPage() {
    const params = useParams();
    const brandId = Array.isArray((params as any)?.id) ? (params as any)?.id[0] : (params as any)?.id;

    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const [minStar, setMinStar] = React.useState<string>("all");
    const [sortBy, setSortBy] = React.useState<"rating" | "reviews">("rating");
    const [selectedProduct, setSelectedProduct] = React.useState<any | undefined>(undefined);

    const { data, isLoading, error } = usePublicProducts({
        pageNumber: page,
        pageSize: 10,
        brandId,
        reviews: true,
        enabled: !!brandId,
        isActive: true,
        searchKeyword: search || undefined,
    } as any);

    const raw = data?.data?.data || data?.products || [];
    const totalPages = data?.data?.totalPages || data?.pagination?.totalPages || data?.totalPages || 1;

    const filtered = raw
        .filter((p: any) => {
            if (minStar === "all") return true;
            if (minStar === "none") return !p.reviewStats || (p.reviewStats?.totalReviews || 0) === 0;
            const n = parseInt(minStar, 10);
            const stat = p.reviewStats;
            if (!stat || (stat.totalReviews || 0) === 0) return false;
            return (stat.averageRating || 0) >= n;
        })
        .sort((a: any, b: any) => {
            if (sortBy === "reviews") {
                return (b.reviewStats?.totalReviews || 0) - (a.reviewStats?.totalReviews || 0);
            }
            return (b.reviewStats?.averageRating || 0) - (a.reviewStats?.averageRating || 0);
        });

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">상품 리뷰</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="상품명 검색"
                        value={search}
                        onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                        className="w-56"
                    />
                    <Select value={minStar} onValueChange={(v) => { setPage(1); setMinStar(v); }}>
                        <SelectTrigger className="w-32"><SelectValue placeholder="평점" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="none">평점 없음</SelectItem>
                            <SelectItem value="1">1점 이상</SelectItem>
                            <SelectItem value="2">2점 이상</SelectItem>
                            <SelectItem value="3">3점 이상</SelectItem>
                            <SelectItem value="4">4점 이상</SelectItem>
                            <SelectItem value="5">5점 이상</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="정렬" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rating">평점순</SelectItem>
                            <SelectItem value="reviews">리뷰수순</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => { setSearch(""); setMinStar("all"); setSortBy("rating"); setPage(1); }}>초기화</Button>
                </div>
            </div>

            {error && (
                <div className="text-red-600">불러오기에 실패했습니다.</div>
            )}

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="p-3 text-left">상품</th>
                            <th className="p-3 text-right">평점</th>
                            <th className="p-3 text-right">리뷰수</th>
                            <th className="p-3 text-right">작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td className="p-4" colSpan={3}>불러오는 중...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td className="p-6 text-center text-gray-500" colSpan={3}>리뷰 데이터가 없습니다</td></tr>
                        ) : (
                            filtered.map((p: any) => (
                                <tr key={p.id} className="border-t">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <img src={p.images?.[0] || p.thumbUrl || "/logo.png"} alt={p.name} className="w-10 h-10 object-cover rounded" />
                                            <div>
                                                <div className="font-medium text-gray-900">{p.name}</div>
                                                <div className="text-xs text-gray-500">{p.brand?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">{p.reviewStats?.averageRating ?? 0}</td>
                                    <td className="p-3 text-right">{p.reviewStats?.totalReviews ?? 0}</td>
                                    <td className="p-3 text-right">
                                        <Button variant="outline" size="sm" onClick={() => setSelectedProduct(p)}>빠른보기</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((x) => x - 1)}>이전</Button>
                <div className="text-sm text-gray-600 px-2 py-1">{page} / {totalPages}</div>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((x) => x + 1)}>다음</Button>
            </div>

            {/* Quick view modal for product reviews */}
            <ProductReviewsQuickModal
                brandId={brandId}
                product={selectedProduct}
                onClose={() => setSelectedProduct(undefined as any)}
            />
        </div>
    );
}

function ProductReviewsQuickModal({ brandId, product, onClose }: { brandId?: string, product?: any, onClose: () => void }) {
    const open = !!product;
    const [reviews, setReviews] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState<any>(null);
    const productId = product?.id;

    React.useEffect(() => {
        const run = async () => {
            if (!productId) return;
            try {
                const [listRes, statsRes] = await Promise.all([
                    fetch(`/api/review/product/${productId}`),
                    fetch(`/api/review/product/${productId}/stats`)
                ]);
                if (listRes.ok) {
                    const json = await listRes.json();
                    setReviews(json?.data || json?.reviews || []);
                }
                if (statsRes.ok) {
                    const json = await statsRes.json();
                    setStats(json?.data || json);
                }
            } catch (e) {
                console.error('load product reviews error', e);
            }
        };
        if (open) run();
    }, [productId, open]);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>상품 리뷰 - {product?.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">평점: <span className="font-medium text-gray-900">{product?.reviewStats?.averageRating ?? 0}</span> · 리뷰수: <span className="font-medium text-gray-900">{product?.reviewStats?.totalReviews ?? 0}</span></div>
                        {!!brandId && !!productId && (
                            <Link className="text-sm text-blue-600 hover:underline" href={`/business/brands/${brandId}/products/${productId}/reviews`}>
                                전체 보기
                            </Link>
                        )}
                    </div>
                    {stats && (
                        <div className="text-xs text-gray-600">최근 평균: {stats?.averageRating ?? 0} · 분포: {stats?.ratingDistribution ? Object.entries(stats.ratingDistribution).map(([k, v]) => `${k}⭐ ${v}`).join(' · ') : '—'}</div>
                    )}
                    <div className="max-h-80 overflow-auto border rounded">
                        {reviews.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">리뷰가 없습니다</div>
                        ) : (
                            <ul className="divide-y">
                                {reviews.slice(0, 10).map((r: any) => (
                                    <li key={r.id} className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium text-gray-900">{r.authorName || '익명'}</div>
                                            <div className="text-xs text-gray-600">{r.rating}⭐</div>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{r.content}</div>
                                        {r.createdAt && (
                                            <div className="mt-1 text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


