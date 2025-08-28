import { useI18n } from "@/providers/I18nProvider";

export default function Cart() {
  const { t } = useI18n();
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("myPage.cart.title")}</h2>
      <div className="text-gray-500">{t("myPage.cart.desc")}</div>
    </div>
  );
}
