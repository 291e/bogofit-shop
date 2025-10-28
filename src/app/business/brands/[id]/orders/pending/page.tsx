import AllOrdersSubSection from "@/components/(Business)/brands/(id)/order-management/subsections/AllOrdersSubSection";

interface PendingOrdersPageProps {
    params: Promise<{ id: string }>;
}

export default async function PendingOrdersPage({ params }: PendingOrdersPageProps) {
    const { id: brandId } = await params;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl">1️⃣</div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">결제 대기</h1>
                        <p className="text-gray-600">결제를 기다리고 있는 주문들입니다</p>
                    </div>
                </div>
            </div>

            <AllOrdersSubSection
                brandId={brandId}
                defaultStatus="pending"
            />
        </div>
    );
}
