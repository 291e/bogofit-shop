import AllOrdersSubSection from "@/components/(Business)/brands/(id)/order-management/subsections/AllOrdersSubSection";

interface OrdersPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersPage({ params, searchParams }: OrdersPageProps) {
  const { id } = await params;
  const { status } = await searchParams;

  return (
    <AllOrdersSubSection
      brandId={id}
      defaultStatus={status || "all"}
    />
  );
}