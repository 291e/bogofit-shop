"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/providers/languageProvider";

export interface AddressFormData {
  label?: string;
  recipient: string;
  phone: string;
  zipCode: string;
  roadAddress: string;
  jibunAddress: string;
  detail: string;
  isDefault: boolean;
}

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddressFormData) => void | Promise<void>;
  initialData?: Partial<AddressFormData>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          zonecode: string;
          roadAddress: string;
          jibunAddress: string;
        }) => void;
        width: string;
        height: string;
      }) => {
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

export default function AddressFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
  mode = 'create',
}: AddressFormDialogProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'search' | 'detail'>(
    mode === 'edit' ? 'detail' : 'search'
  );
  const [formData, setFormData] = useState<AddressFormData>({
    label: '',
    recipient: '',
    phone: '',
    zipCode: '',
    roadAddress: '',
    jibunAddress: '',
    detail: '',
    isDefault: false,
  });

  // Reset step based on mode when dialog opens
  useEffect(() => {
    if (open) {
      setStep(mode === 'edit' ? 'detail' : 'search');
    }
  }, [open, mode]);

  // Initialize form data when dialog opens or initialData changes
  useEffect(() => {
    if (open && initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [open, initialData]);

  const handlePostcodeComplete = (data: { 
    zonecode: string; 
    roadAddress: string; 
    jibunAddress: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      zipCode: data.zonecode,
      roadAddress: data.roadAddress,
      jibunAddress: data.jibunAddress,
    }));
    setStep('detail');
  };

  const openPostcode = () => {
    const postcodeContainer = document.getElementById('postcode-container');
    if (!postcodeContainer) return;

    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: handlePostcodeComplete,
        width: '100%',
        height: '400px',
      }).embed(postcodeContainer);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleBack = () => {
    setStep('search');
    setFormData(prev => ({
      ...prev,
      label: '',
      zipCode: '',
      roadAddress: '',
      jibunAddress: '',
      detail: '',
    }));
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setFormData({
        label: '',
        recipient: '',
        phone: '',
        zipCode: '',
        roadAddress: '',
        jibunAddress: '',
        detail: '',
        isDefault: false,
      });
      setStep(mode === 'edit' ? 'detail' : 'search');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("ui.address.title").replace("{mode}", mode === 'edit' ? t("ui.address.edit") : step === 'search' ? t("ui.address.search") : t("ui.address.enterInfo"))}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? t("ui.address.editDescription")
              : step === 'search' 
                ? t("ui.address.searchDescription")
                : t("ui.address.enterDescription")}
          </DialogDescription>
        </DialogHeader>

        {step === 'search' ? (
          <div>
            <div 
              id="postcode-container" 
              className="w-full border rounded-lg overflow-hidden"
              style={{ minHeight: '400px' }}
            />
            <div className="flex justify-center mt-4">
              <Button onClick={openPostcode} className="w-full">
                {t("ui.address.startSearch")}
              </Button>
            </div>
            {mode === 'edit' && formData.zipCode && (
              <div className="flex justify-center mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('detail')}
                >
                  {t("ui.address.cancelAndBack")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 선택된 주소 표시 */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{t("ui.address.zipCode")}</span>
                <span className="text-sm">{formData.zipCode || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{t("ui.address.roadAddress")}</span>
                <span className="text-sm">{formData.roadAddress || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{t("ui.address.jibunAddress")}</span>
                <span className="text-sm">{formData.jibunAddress || '-'}</span>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (mode === 'create') {
                    handleBack();
                  } else {
                    // Edit mode: Open postcode search
                    setStep('search');
                  }
                }}
                className="mt-2"
              >
                {t("ui.address.reSearch")}
              </Button>
            </div>

            {/* 라벨 (선택사항) */}
            <div className="space-y-2">
              <Label htmlFor="label">{t("ui.address.label")}</Label>
              <Input
                id="label"
                value={formData.label || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder={t("ui.address.labelPlaceholder")}
              />
            </div>

            {/* 받는 분 정보 */}
            <div className="space-y-2">
              <Label htmlFor="recipient">{t("ui.address.recipient")} <span className="text-red-500">*</span></Label>
              <Input
                id="recipient"
                value={formData.recipient}
                onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                placeholder={t("ui.address.recipientPlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("ui.address.phone")} <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder={t("ui.address.phonePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">{t("ui.address.detailAddress")} <span className="text-red-500">*</span></Label>
              <Input
                id="detail"
                value={formData.detail}
                onChange={(e) => setFormData(prev => ({ ...prev, detail: e.target.value }))}
                placeholder={t("ui.address.detailAddressPlaceholder")}
                required
              />
            </div>

            {/* 기본 배송지 설정 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isDefault: checked as boolean }))
                }
              />
              <Label 
                htmlFor="isDefault" 
                className="text-sm font-normal cursor-pointer"
              >
                {t("ui.address.setAsDefault")}
              </Label>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleClose(false)}
                className="flex-1"
                disabled={isLoading}
              >
                {t("ui.address.cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? t("ui.address.saving") : t("ui.address.save")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

