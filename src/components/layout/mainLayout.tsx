import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50 to-pink-50">
      <Header />
      <main className="flex-1 w-full mx-auto">
        <div>{children}</div>
      </main>
      <Footer />
    </div>
  );
}
