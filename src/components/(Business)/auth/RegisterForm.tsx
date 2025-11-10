"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RegisterDto } from "@/types/auth";

import { Building2, User, Lock, Mail, Phone } from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import { useLanguage } from "@/providers/languageProvider";

function BusinessRegisterForm() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterDto>({
    userId: "",
    email: "",
    password: "",
    phone: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.userId || !formData.email || !formData.phone || !formData.password) {
      setError(t("header.business.registerError"));
      setLoading(false);
      return;
    }

    try {
      // Use register from AuthProvider (handles toast notifications)
      await register({
        userId: formData.userId,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
      });
      
      // Reset form
      setFormData({
        userId: "",
        email: "",
        password: "",
        phone: "",
        name: "",
      });
      
      // Redirect to business page
      window.location.href = "/business/brands";
    } catch (err) {
      // Error toast already handled by AuthProvider
      setError(err instanceof Error ? err.message : t("header.business.registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Form content */}
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-blue-600">{t("header.business.registerTitle")}</h3>
              <p className="text-sm font-medium text-gray-600 mt-1">{t("header.business.registerSubtitle")}</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="registerName" className="text-sm font-bold text-gray-700">{t("header.business.name")}</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerName"
                    name="registerName"
                    type="text"
                    required
                    placeholder={t("header.business.namePlaceholder")}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="registerUserId" className="text-sm font-bold text-gray-700">{t("header.business.businessId")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerUserId"
                    name="registerUserId"
                    type="text"
                    required
                    placeholder={t("header.business.businessIdPlaceholder")}
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="registerEmail" className="text-sm font-bold text-gray-700">{t("header.business.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerEmail"
                    name="registerEmail"
                    type="email"
                    required
                    placeholder={t("header.business.emailPlaceholder")}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="registerPhone" className="text-sm font-bold text-gray-700">{t("header.business.phone")}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerPhone"
                    name="registerPhone"
                    type="tel"
                    required
                    placeholder={t("header.business.phonePlaceholder")}
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="registerPassword" className="text-sm font-bold text-gray-700">{t("header.business.password")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerPassword"
                    name="registerPassword"
                    type="password"
                    required
                    placeholder={t("header.business.passwordPlaceholder")}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg" disabled={loading}>
                  {loading ? t("header.business.registering") : t("header.business.registerButton")}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {t("header.business.regularUser")}{" "}
                    <a
                      href="/login"
                      className="text-blue-500 hover:text-blue-400 hover:underline"
                    >
                      {t("header.business.regularRegister")}
                    </a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessRegisterFormWrapper() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("header.business.registerPageLoading")}</p>
          </div>
        </div>
      }
    >
      <BusinessRegisterForm />
    </Suspense>
  );
}
  
export default BusinessRegisterFormWrapper;
