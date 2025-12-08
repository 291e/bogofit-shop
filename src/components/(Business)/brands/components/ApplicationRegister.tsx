"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateApplicationResponse, ApplicationFormData, ApiApplicationResponse } from "@/types/application";
import { useAuth } from "@/providers/authProvider";
import { Building2, User, Mail, Phone, FileText } from "lucide-react";
import { ImageUploader } from "@/components/ui/imageUploader";
import { useLanguage } from "@/providers/languageProvider";
// import { toast } from "sonner"; // Unused - toast handled by mutation hook

interface ApplicationRegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: CreateApplicationResponse) => void; // Pass response data
  applicationStatus?: string; // "none", "rejected", "banned"
  existingApplication?: ApiApplicationResponse | null; // Existing application for editing
}

export default function ApplicationRegister({
  isOpen,
  onClose,
  onSuccess,
  applicationStatus = "none",
  existingApplication = null
}: ApplicationRegisterProps) {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [formData, setFormData] = useState<ApplicationFormData>({
    businessName: "",
    bizRegNo: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    docs: [],
  });
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState<string | null>(null);
  const [taxCodeUrl, setTaxCodeUrl] = useState<string | null>(null);
  const [otherDocsUrls, setOtherDocsUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form with existing application data
  useEffect(() => {
    if (existingApplication?.application) {
      const app = existingApplication.application;
      setFormData({
        businessName: app.businessName || "",
        bizRegNo: app.bizRegNo || "",
        contactName: app.contactName || "",
        contactPhone: app.contactPhone || "",
        contactEmail: app.contactEmail || "",
        docs: [],
      });

      // Parse and populate document URLs
      try {
        const docs = JSON.parse(app.docs || "[]");
        if (Array.isArray(docs)) {
          const businessLicense = docs.find(d => d.type === "business_license");
          const taxCode = docs.find(d => d.type === "tax_code");
          const others = docs.filter(d => d.type === "other");

          if (businessLicense) setBusinessLicenseUrl(businessLicense.url);
          if (taxCode) setTaxCodeUrl(taxCode.url);
          if (others.length > 0) setOtherDocsUrls(others.map(d => d.url));
        }
      } catch (err) {
        console.error("Error parsing docs:", err);
      }
    }
  }, [existingApplication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.businessName) {
      setError(t("header.business.applicationRegister.errors.companyNameRequired"));
      setLoading(false);
      return;
    }

    if (!businessLicenseUrl) {
      setError(t("header.business.applicationRegister.errors.businessLicenseRequired"));
      setLoading(false);
      return;
    }

    if (!taxCodeUrl) {
      setError(t("header.business.applicationRegister.errors.taxInvoiceRequired"));
      setLoading(false);
      return;
    }

    if (!token) {
      setError(t("header.business.applicationRegister.errors.loginRequired"));
      setLoading(false);
      return;
    }

    // Build docs array from uploaded images
    const docs = [];
    if (businessLicenseUrl) {
      docs.push({
        type: "business_license",
        name: t("header.business.applicationRegister.businessLicense"),
        url: businessLicenseUrl
      });
    }
    if (taxCodeUrl) {
      docs.push({
        type: "tax_code",
        name: t("header.business.applicationRegister.taxInvoice"),
        url: taxCodeUrl
      });
    }
    otherDocsUrls.forEach((url, index) => {
      docs.push({
        type: "other",
        name: `${t("header.business.applicationRegister.otherDocuments")}_${index + 1}`,
        url
      });
    });

    try {
      const isEditing = !!existingApplication;
      // Use PUT for updates, POST for creation
      const response = await fetch("/api/application", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          bizRegNo: formData.bizRegNo,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          docs: docs,
        }),
      });

      const data: CreateApplicationResponse = await response.json();

      if (data.success) {
        setError("");
        // Toast is handled by the mutation hook
        onSuccess(data); // Pass response data
      } else {
        setError(data.message || (isEditing ? t("header.business.applicationRegister.errors.editFailed") : t("header.business.applicationRegister.errors.submitFailed")));
      }
    } catch (err) {
      setError(t("header.business.applicationRegister.errors.serverError"));
      console.error("Application error:", err);
    } finally {
      setLoading(false);
    }
  };

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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-600">
            <FileText className="h-6 w-6" />
            {existingApplication ? t("header.business.applicationRegister.titleEdit") :
              applicationStatus === "rejected" ? t("header.business.applicationRegister.titleResubmit") :
                applicationStatus === "banned" ? t("header.business.applicationRegister.titleRecover") : t("header.business.applicationRegister.title")}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            {existingApplication ? t("header.business.applicationRegister.subtitleEdit") :
              applicationStatus === "rejected" ? t("header.business.applicationRegister.subtitleResubmit") :
                applicationStatus === "banned" ? t("header.business.applicationRegister.subtitleRecover") :
                  t("header.business.applicationRegister.subtitle")}
          </p>
          {existingApplication?.application?.noteAdmin && (
            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm font-semibold text-red-800 mb-1">{t("header.business.applicationRegister.rejectionReason")}</p>
              <p className="text-sm text-red-700">{existingApplication.application.noteAdmin}</p>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="businessName" className="text-base font-bold text-gray-700">
                {t("header.business.applicationRegister.companyName")}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  placeholder={t("header.business.applicationRegister.companyNamePlaceholder")}
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="h-10 pl-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="bizRegNo" className="text-base font-bold text-gray-700">
                {t("header.business.applicationRegister.businessRegistrationNumber")}
              </label>
              <Input
                id="bizRegNo"
                name="bizRegNo"
                type="text"
                placeholder={t("header.business.applicationRegister.businessRegistrationNumberPlaceholder")}
                value={formData.bizRegNo}
                onChange={(e) => setFormData(prev => ({ ...prev, bizRegNo: e.target.value }))}
                className="h-10 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="contactName" className="text-base font-bold text-gray-700">
                {t("header.business.applicationRegister.contactPerson")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="contactName"
                  name="contactName"
                  type="text"
                  placeholder={t("header.business.applicationRegister.contactPersonPlaceholder")}
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  className="h-10 pl-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="contactPhone" className="text-base font-bold text-gray-700">
                {t("header.business.applicationRegister.contact")}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder={t("header.business.applicationRegister.contactPlaceholder")}
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="h-10 pl-12 text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="contactEmail" className="text-base font-bold text-gray-700">
              {t("header.business.applicationRegister.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder={t("header.business.applicationRegister.emailPlaceholder")}
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="h-10 pl-12 text-base"
              />
            </div>
          </div>

          {/* Documents Upload Section */}
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("header.business.applicationRegister.requiredDocuments")}</h3>
              <p className="text-base text-gray-600 mb-6">
                {t("header.business.applicationRegister.requiredDocumentsDescription")}
              </p>

              <div className="space-y-6">
                {/* Business License */}
                <div className="space-y-3">
                  <label className="text-base font-bold text-gray-700">
                    {t("header.business.applicationRegister.businessLicense")}
                  </label>
                  <ImageUploader
                    value={businessLicenseUrl || undefined}
                    onChange={(url) => setBusinessLicenseUrl(url as string | null)}
                    single={true}
                    folder="brands"
                    height="180px"
                    previewSize="md"
                    disabled={loading}
                    onError={(err) => setError(err)}
                  />
                </div>

                {/* Tax Code */}
                <div className="space-y-3">
                  <label className="text-base font-bold text-gray-700">
                    {t("header.business.applicationRegister.taxInvoice")}
                  </label>
                  <ImageUploader
                    value={taxCodeUrl || undefined}
                    onChange={(url) => setTaxCodeUrl(url as string | null)}
                    single={true}
                    folder="brands"
                    height="180px"
                    previewSize="md"
                    disabled={loading}
                    onError={(err) => setError(err)}
                  />
                </div>

                {/* Additional Documents */}
                <div className="space-y-3">
                  <label className="text-base font-bold text-gray-700">
                    {t("header.business.applicationRegister.otherDocuments")}
                  </label>
                  <ImageUploader
                    value={otherDocsUrls}
                    onChange={(urls) => setOtherDocsUrls((urls as string[]) || [])}
                    single={false}
                    maxFiles={3}
                    folder="brands"
                    height="180px"
                    previewSize="sm"
                    disabled={loading}
                    onError={(err) => setError(err)}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 text-base"
            >
              {t("header.business.applicationRegister.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              disabled={loading}
            >
              {loading
                ? (existingApplication ? t("header.business.applicationRegister.editing") : t("header.business.applicationRegister.submitting"))
                : (existingApplication ? t("header.business.applicationRegister.submitEdit") : t("header.business.applicationRegister.submit"))
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
