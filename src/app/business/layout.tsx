import BusinessHeader from "@/components/(Business)/layout/BusinessHeader";
export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader />
      

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      
    </div>
  );
}
