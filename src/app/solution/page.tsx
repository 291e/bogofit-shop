import Cafe24VirtualFitting from "@/components/product/Cafe24VirtualFitting";

export default function EventPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <Cafe24VirtualFitting
        productTitle={"test"}
        productCategory={"test"}
        currentImage={
          "https://goldsilk.net/product/image_zoom2.html?product_no=437&cate_no=60&display_group=1"
        }
      />
    </main>
  );
}
