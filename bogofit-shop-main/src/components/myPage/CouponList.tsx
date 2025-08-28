import { useI18n } from "@/providers/I18nProvider";

export default function CouponList() {
  const { t } = useI18n();
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("myPage.coupons.title")}</h2>
      <div className="text-gray-500">{t("myPage.coupons.desc")}</div>
    </div>
  );
}
