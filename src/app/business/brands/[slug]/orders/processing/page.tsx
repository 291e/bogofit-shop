import AllOrdersSubSection from "@/components/(Business)/brands/(id)/order-management/subsections/AllOrdersSubSection";

interface ProcessingOrdersPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProcessingOrdersPage({ params }: ProcessingOrdersPageProps) {
    const { id: brandId } = await params;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl">3️⃣</div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">배송 준비 중</h1>
                        <p className="text-gray-600">현재 배송 준비 중인 주문들입니다</p>
                    </div>
                </div>
            </div>

            <AllOrdersSubSection
                brandId={brandId}
                defaultStatus="processing"
            />
        </div>
    );
}
