"use client";

import AddressFormDialog, { AddressFormData } from "@/components/ui/address-form-dialog";
import { useCreateAddress, useUpdateAddress } from "@/hooks/useAddresses";
import { Address } from "@/types/address";
import { toast } from "sonner";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAddress?: Address | null;
}

export default function AddressDialog({ open, onOpenChange, editingAddress }: AddressDialogProps) {
  const createMutation = useCreateAddress(); // User addresses (brandId = null)
  const updateMutation = useUpdateAddress();
  const isEditMode = !!editingAddress;

  const handleSubmit = async (data: AddressFormData) => {
    // Validation
    if (!data.recipient.trim()) {
      toast.error('받는 분 이름을 입력해주세요');
      return;
    }
    if (!data.phone.trim()) {
      toast.error('연락처를 입력해주세요');
      return;
    }
    if (!data.zipCode || !data.roadAddress) {
      toast.error('주소를 검색해주세요');
      return;
    }
    if (!data.detail.trim()) {
      toast.error('상세 주소를 입력해주세요');
      return;
    }

    try {
      if (isEditMode && editingAddress) {
        // Update existing address
        const updateData = {
          id: editingAddress.id,
          brandId: editingAddress.brandId,
          addressType: editingAddress.addressType,
          label: data.label,
          recipient: data.recipient,
          phone: data.phone,
          countryCode: 'KR',
          zipCode: data.zipCode,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
          detail: data.detail,
          isDefault: data.isDefault,
        };

        await updateMutation.mutateAsync(updateData as Partial<Address> & { id: string });

        toast.success('주소가 수정되었습니다');
      } else {
        // Create new address
        const createData = {
          brandId: null, // User address
          addressType: 'shipping', // Default to shipping
          label: data.label || null, // ✅ Gửi label từ form
          recipient: data.recipient,
          phone: data.phone,
          countryCode: 'KR',
          zipCode: data.zipCode,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
          detail: data.detail,
          isDefault: data.isDefault,
        };
        
        await createMutation.mutateAsync(createData as Partial<Address>);

        toast.success('주소가 추가되었습니다');
      }
      
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 
        isEditMode ? '주소 수정에 실패했습니다' : '주소 추가에 실패했습니다');
    }
  };

  // Prepare initial data for edit mode
  const initialData = editingAddress ? {
    recipient: editingAddress.recipient,
    phone: editingAddress.phone || '',
    zipCode: editingAddress.zipCode || '',
    roadAddress: editingAddress.roadAddress,
    jibunAddress: editingAddress.jibunAddress || '',
    detail: editingAddress.detail || '',
    isDefault: editingAddress.isDefault,
    label: editingAddress.label || '',
  } : undefined;

  return (
    <AddressFormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      initialData={initialData}
      isLoading={createMutation.isPending || updateMutation.isPending}
      mode={isEditMode ? "edit" : "create"}
    />
  );
}

