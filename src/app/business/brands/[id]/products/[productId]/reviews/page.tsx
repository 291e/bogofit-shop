/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductReviewsFullPage() {
    const params = useParams();
    const brandId = (params as any)?.id;
    const productId = (params as any)?.productId;

    const [reviews, setReviews] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState<any>(null);

    React.useEffect(() => {
        const run = async () => {
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
                console.error('full page load reviews error', e);
            }
        };
        if (productId) run();
    }, [productId]);

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">상품 리뷰 상세</h1>
                <Link className="text-sm text-blue-600 hover:underline" href={`/business/brands/${brandId}/products/reviews`}>
                    목록으로
                </Link>
            </div>

            {stats && (
                <div className="mb-4 text-sm text-gray-700">평점 {stats?.averageRating ?? 0} · 리뷰수 {stats?.totalReviews ?? 0}</div>
            )}

            <div className="border rounded">
                {reviews.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">리뷰가 없습니다</div>
                ) : (
                    <ul className="divide-y">
                        {reviews.map((r: any) => (
                            <li key={r.id} className="p-4">
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
    );
}


