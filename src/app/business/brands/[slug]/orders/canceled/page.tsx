import AllOrdersSubSection from "@/components/(Business)/brands/(id)/order-management/subsections/AllOrdersSubSection";

interface CanceledOrdersPageProps {
    params: Promise<{ id: string }>;
}

export default async function CanceledOrdersPage({ params }: CanceledOrdersPageProps) {
    const { id: brandId } = await params;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl">5️⃣</div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">취소됨</h1>
                        <p className="text-gray-600">취소된 주문들입니다</p>
                    </div>
                </div>
            </div>

            <AllOrdersSubSection
                brandId={brandId}
                defaultStatus="canceled"
            />
        </div>
    );
}
