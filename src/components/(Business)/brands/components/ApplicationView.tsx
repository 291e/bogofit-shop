"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Download
} from "lucide-react";
import { ApiApplicationResponse } from "@/types/application";
import Image from "next/image";
import { useLanguage } from "@/providers/languageProvider";

interface ApplicationViewProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApiApplicationResponse | null;
  onEdit?: () => void; // Callback to open edit form
}

export default function ApplicationView({ isOpen, onClose, application, onEdit }: ApplicationViewProps) {
  const { t } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "banned":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseDocs = (docsString: string) => {
    try {
      const parsed = JSON.parse(docsString);
      // If it's already an array, return it
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // If it's an object, return it as is for backward compatibility
      return parsed;
    } catch {
      return [];
    }
  };

  if (!application?.application) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("header.business.applicationView.noApplication")}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">{t("header.business.applicationView.noApplicationDescription")}</p>
          <div className="flex justify-end">
            <Button onClick={onClose}>{t("header.business.applicationView.close")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const app = application.application;
  const docs = parseDocs(app.docs || '[]');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[35vw] max-h-[90vh] overflow-y-auto"
        style={{
          width: '35vw',
          maxWidth: '45vw',
          minWidth: '25vw'
        }}
      >
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <span>{t("header.business.applicationView.title")}</span>
              <p className="text-sm font-normal text-gray-500 mt-1">
                {t("header.business.applicationView.subtitle")}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card className={`border-l-4 ${app.status === 'rejected' ? 'border-l-red-500' : 'border-l-blue-500'
            }`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(app.status)}
                  <span>{t("header.business.applicationView.status")}</span>
                </div>
                <Badge variant={getStatusVariant(app.status)} className="text-sm px-3 py-1">
                  {getStatusText(app.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t("header.business.applicationView.applicationNumber")} <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{app.appCode}</span>
                </span>
                {(app.status === "pending" || app.status === "rejected") && onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onEdit();
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t("header.business.applicationView.edit")}
                  </Button>
                )}
              </div>

              {/* Rejection Reason - Inline with Status */}
              {app.status === 'rejected' && app.noteAdmin && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-bold text-red-800">{t("header.business.applicationView.rejectionReason")}</p>
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed ml-7">
                    {app.noteAdmin}
                  </p>
                  <p className="text-xs text-red-600 mt-3 italic ml-7">
                    {t("header.business.applicationView.rejectionNote")}
                  </p>
                </div>
              )}

              {/* Other Admin Notes */}
              {app.status !== 'rejected' && app.noteAdmin && (
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-bold text-yellow-800">{t("header.business.applicationView.adminNote")}</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed ml-7">
                    {app.noteAdmin}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Building2 className="h-5 w-5" />
                {t("header.business.applicationView.businessInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-semibold text-gray-700">
                    {t("header.business.applicationView.companyName")}
                  </label>
                  <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg border">
                    {app.businessName}
                  </p>
                </div>
                {app.bizRegNo && (
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-700">
                      {t("header.business.applicationView.businessRegistrationNumber")}
                    </label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg border font-mono">
                      {app.bizRegNo}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <User className="h-5 w-5" />
                {t("header.business.applicationView.contactInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {app.contactName && (
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t("header.business.applicationView.contactPerson")}
                    </label>
                    <p className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg border">
                      {app.contactName}
                    </p>
                  </div>
                )}
                {app.contactPhone && (
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      {t("header.business.applicationView.contact")}
                    </label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg border font-mono">
                      {app.contactPhone}
                    </p>
                  </div>
                )}
                {app.contactEmail && (
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {t("header.business.applicationView.email")}
                    </label>
                    <p className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg border">
                      {app.contactEmail}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {((Array.isArray(docs) && docs.length > 0) || (!Array.isArray(docs) && Object.keys(docs).length > 0)) && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <FileText className="h-5 w-5" />
                  {t("header.business.applicationView.attachedDocuments")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(docs) ? (
                    // New format: array of {type, name, url}
                    docs.map((doc, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-700 capitalize">
                            {doc.name || doc.type.replace(/_/g, ' ')}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t("header.business.applicationView.viewLarge")}
                          </Button>
                        </div>
                        <div className="relative group cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-all">
                          <Image
                            src={doc.url}
                            alt={doc.name || doc.type}
                            width={400}
                            height={256}
                            className="w-full h-64 object-cover"
                            onClick={() => window.open(doc.url, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                            <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Old format: object with key-value pairs
                    Object.entries(docs).map(([key, value]) => (
                      <div key={key} className="col-span-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border hover:shadow-sm transition-shadow">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700 capitalize mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-xs text-gray-500 font-mono break-all">{value as string}</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4">
                          <Download className="h-4 w-4 mr-1" />
                          {t("header.business.applicationView.download")}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calendar className="h-5 w-5" />
                {t("header.business.applicationView.timeInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">{t("header.business.applicationView.applicationDate")}</span>
                <span className="text-sm text-gray-900 font-mono">{formatDate(app.createdAt)}</span>
              </div>
              {app.decidedAt && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">{t("header.business.applicationView.decisionDate")}</span>
                  <span className="text-sm text-gray-900 font-mono">{formatDate(app.decidedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-500">
            {(app.status === "pending" || app.status === "rejected") && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {t("header.business.applicationView.canEdit")}
              </span>
            )}
            {(app.status === "approved" || app.status === "banned") && (
              <span className="flex items-center gap-1 text-gray-400">
                <XCircle className="h-4 w-4" />
                {t("header.business.applicationView.cannotEdit")}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {(app.status === "pending" || app.status === "rejected") && onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t("header.business.applicationView.edit")}
              </Button>
            )}
            <Button onClick={onClose} variant="outline">
              {t("header.business.applicationView.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
