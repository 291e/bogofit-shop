/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/providers/languageProvider";
import { useBrandContext } from "../../../layout";

export default function ProductReviewsFullPage() {
    const { t } = useLanguage();
    const params = useParams();
    const { brand } = useBrandContext();
    const productSlug = params['product-slug'] as string;

    const [reviews, setReviews] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState<any>(null);

    React.useEffect(() => {
        const run = async () => {
            try {
                const [listRes, statsRes] = await Promise.all([
                    fetch(`/api/review/product/${productSlug}`),
                    fetch(`/api/review/product/${productSlug}/stats`)
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
        if (productSlug) run();
    }, [productSlug]);

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">{t("header.business.brandDetail.products.reviews.detailTitle")}</h1>
                <Link className="text-sm text-blue-600 hover:underline" href={`/business/brands/${brand.slug}/products/reviews`}>
                    {t("header.business.brandDetail.products.reviews.backToList")}
                </Link>
            </div>

            {stats && (
                <div className="mb-4 text-sm text-gray-700">{t("header.business.brandDetail.products.reviews.ratingAndCount", { rating: stats?.averageRating ?? 0, count: stats?.totalReviews ?? 0 })}</div>
            )}

            <div className="border rounded">
                {reviews.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">{t("header.business.brandDetail.products.reviews.noReviews")}</div>
                ) : (
                    <ul className="divide-y">
                        {reviews.map((r: any) => (
                            <li key={r.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-900">{r.authorName || t("header.business.brandDetail.products.reviews.anonymous")}</div>
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


