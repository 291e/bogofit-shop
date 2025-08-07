import BusinessLayoutWrapper from "@/components/business/BusinessLayoutWrapper";

interface BusinessLayoutProps {
  children: React.ReactNode;
}

export default function BusinessLayout({ children }: BusinessLayoutProps) {
  return <BusinessLayoutWrapper>{children}</BusinessLayoutWrapper>;
}
