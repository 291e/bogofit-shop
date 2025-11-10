"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Eye, Building2, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { ApiApplicationResponse } from "@/types/application";
import { useLanguage } from "@/providers/languageProvider";

interface DashboardSectionProps {
  applicationData: ApiApplicationResponse | null;
  onShowApplicationView: () => void;
  onShowApplicationModal: () => void;
  onCreateBrand: () => void;
}

export default function DashboardSection({
  applicationData,
  onShowApplicationView,
  onShowApplicationModal,
  onCreateBrand,
}: DashboardSectionProps) {
  const { t } = useLanguage();
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "banned":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return t("header.business.dashboard.statusApproved");
      case "pending":
        return t("header.business.dashboard.statusPending");
      case "rejected":
        return t("header.business.dashboard.statusRejected");
      case "banned":
        return t("header.business.dashboard.statusBanned");
      default:
        return t("header.business.dashboard.statusUnknown");
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "banned":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Check if application exists
  const hasApplication = !!applicationData?.application;
  const application = applicationData?.application;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Section 1 - 비즈니스 대시보드 */}
      <Card className="border-2 border-indigo-400 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {t("header.business.dashboard.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {t("header.business.dashboard.welcome")}
          </p>
          {hasApplication && application && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t("header.business.dashboard.applicationCode")}</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {application.appCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t("header.business.dashboard.status")}</span>
                <Badge variant={getStatusVariant(application.status)} className="flex items-center gap-1">
                  {getStatusIcon(application.status)}
                  {getStatusText(application.status)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t("header.business.dashboard.businessName")}</span>
                <span className="text-sm">{application.businessName}</span>
              </div>
            </div>
          )}
          {!hasApplication && (
            <div className="text-center mt-16">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">{t("header.business.dashboard.noApplication")}</p>
              <Button 
                onClick={onShowApplicationModal}
                size="sm"
                className="w-full font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("header.business.dashboard.createApplication")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2 - 신청서 관리 */}
      {hasApplication && (
        <Card className="border-2 border-emerald-400 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              {t("header.business.dashboard.applicationManagement")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {t("header.business.dashboard.applicationDescription")}
            </p>
            <Button 
              onClick={onShowApplicationView}
              className="w-full font-semibold mt-6"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("header.business.dashboard.viewApplication")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 3 - 브랜드 관리 (Only show when approved) */}
      {hasApplication && 
       application?.status === "approved" && (
        <Card className="border-2 border-purple-400 bg-purple-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Building2 className="h-5 w-5 text-purple-600" />
              {t("header.business.dashboard.brandManagement")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-700 mb-4">
              {t("header.business.dashboard.brandDescription")}
            </p>
            <Button 
              onClick={onCreateBrand}
              className="w-full font-semibold mt-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("header.business.dashboard.registerBrand")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Messages for other states */}
      {hasApplication && 
       application?.status === "pending" && (
        <Card className="border-2 border-yellow-300 bg-yellow-50 shadow-lg md:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-yellow-800 mb-2">{t("header.business.dashboard.underReview")}</h3>
              <p className="text-yellow-700">
                {t("header.business.dashboard.underReviewDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {hasApplication && 
       application?.status === "rejected" && (
        <Card className="border-2 border-red-300 bg-red-50 shadow-lg md:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">{t("header.business.dashboard.rejected")}</h3>
              <p className="text-red-700 mb-4">
                {t("header.business.dashboard.rejectedDescription")}
              </p>
              <Button 
                onClick={onShowApplicationModal}
                variant="outline"
                className="w-full font-semibold"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t("header.business.dashboard.reapply")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasApplication && 
       application?.status === "banned" && (
        <Card className="border-2 border-red-300 bg-red-50 shadow-lg md:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">{t("header.business.dashboard.accountBanned")}</h3>
              <p className="text-red-700 mb-4">
                {t("header.business.dashboard.bannedDescription")}
              </p>
              <Button 
                onClick={onShowApplicationView}
                variant="outline"
                className="w-full font-semibold"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t("header.business.dashboard.viewApplicationInfo")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
