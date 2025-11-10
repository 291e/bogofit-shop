"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, ExternalLink } from "lucide-react";
import { BrandResponseDto } from "@/types/brand";
import { useLanguage } from "@/providers/languageProvider";

interface BrandCardProps {
  brand: BrandResponseDto;
  onViewBrand?: (brand: BrandResponseDto) => void;
}

export default function BrandCard({ brand, onViewBrand }: BrandCardProps) {
  const { t } = useLanguage();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "banned":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return t("header.business.brandCard.statusApproved");
      case "pending":
        return t("header.business.brandCard.statusPending");
      case "rejected":
        return t("header.business.brandCard.statusRejected");
      case "banned":
        return t("header.business.brandCard.statusBanned");
      default:
        return t("header.business.brandCard.statusUnknown");
    }
  };

  const getPaymentModeText = (paymentMode: string) => {
    switch (paymentMode) {
      case "platform":
        return t("header.business.brandCard.paymentPlatform");
      case "business":
        return t("header.business.brandCard.paymentBusiness");
      default:
        return paymentMode;
    }
  };

  return (
    <Card className="border-2 border-gray-200 shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                {brand.name}
              </CardTitle>
              <p className="text-sm text-gray-500 font-mono">
                @{brand.slug}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(brand.status)} font-medium`}>
            {getStatusText(brand.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {brand.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {brand.description}
          </p>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          {brand.contactEmail && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{brand.contactEmail}</span>
            </div>
          )}
          {brand.contactPhone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{brand.contactPhone}</span>
            </div>
          )}
        </div>

        {/* Payment Mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{t("header.business.brandCard.paymentMode")}</span>
          <Badge variant="outline" className="text-xs">
            {getPaymentModeText(brand.paymentMode)}
          </Badge>
        </div>

        {/* Created Date */}
        <div className="text-xs text-gray-400">
          {t("header.business.brandCard.registeredDate")} {new Date(brand.createdAt).toLocaleDateString('ko-KR')}
        </div>

        {/* Action Button */}
        <Button 
          className={`w-full mt-4 group transition-all duration-300 ${
            brand.status === "approved"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border-0 font-semibold"
              : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
          }`}
          variant={brand.status === "approved" ? "default" : "outline"}
          disabled={brand.status !== "approved"}
          onClick={() => onViewBrand?.(brand)}
        >
          <ExternalLink className={`h-4 w-4 mr-2 transition-transform duration-300 ${
            brand.status === "approved" ? "group-hover:translate-x-1" : ""
          }`} />
          {brand.status === "approved" ? t("header.business.brandCard.viewBrand") : t("header.business.brandCard.pendingApproval")}
        </Button>
      </CardContent>
    </Card>
  );
}
