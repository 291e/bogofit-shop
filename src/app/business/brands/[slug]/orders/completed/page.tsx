import AllOrdersSubSection from "@/components/(Business)/brands/(id)/order-management/subsections/AllOrdersSubSection";

interface CompletedOrdersPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompletedOrdersPage({ params }: CompletedOrdersPageProps) {
  const { id: brandId } = await params;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">4️⃣</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">배송 완료</h1>
            <p className="text-gray-600">배송이 완료된 주문들입니다</p>
          </div>
        </div>
      </div>

      <AllOrdersSubSection
        brandId={brandId}
        defaultStatus="completed"
      />
    </div>
  );
}