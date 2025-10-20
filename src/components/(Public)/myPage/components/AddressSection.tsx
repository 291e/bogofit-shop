"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit, Trash2, Phone, Star } from "lucide-react";
import { Address } from "@/types/address";
import { useAddresses, useSetDefaultAddress, useDeleteAddress } from "@/hooks/useAddresses";
import { toast } from "sonner";
import AddressDialog from "./AddressDialog";

export default function AddressSection() {
  // ✅ Fetch addresses directly in this component
  const { data: addresses = [], isLoading } = useAddresses({ 
    addressType: 'shipping' 
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const setDefaultMutation = useSetDefaultAddress();
  const deleteMutation = useDeleteAddress();

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      toast.success('기본 배송지로 설정되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '기본 배송지 설정에 실패했습니다');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('주소가 삭제되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '주소 삭제에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">주소를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (addresses.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">등록된 주소가 없습니다</h3>
            <p className="text-gray-500 mb-6">새로운 배송지를 등록해보세요</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              새 주소 추가
            </Button>
          </CardContent>
        </Card>
        <AddressDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">배송지 관리</h2>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            새 주소 추가
          </Button>
        </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => {
          return (
          <Card key={address.id} className={address.isDefault ? "border-pink-500 border-2 shadow-sm" : "hover:shadow-md transition-shadow"}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <CardTitle className="text-lg font-semibold">
                      {address.recipient}
                    </CardTitle>
                    {address.isDefault && (
                      <Badge className="bg-pink-500 text-white hover:bg-pink-600 flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3 h-3" />
                        기본
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {address.addressType === 'shipping' ? '배송지' :
                       address.addressType === 'return' ? '반품지' :
                       address.addressType === 'warehouse' ? '창고' :
                       address.addressType === 'billing' ? '청구지' : address.addressType}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Phone */}
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{address.phone || '-'}</span>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {address.label && (
                        <Badge variant="outline" className="text-xs font-normal">
                          {address.label}
                        </Badge>
                      )}
                      <p className="text-gray-500 text-xs">({address.zipCode})</p>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{address.roadAddress}</p>
                    {address.detail && (
                      <p className="text-gray-600 mt-1">{address.detail}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  {!address.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={setDefaultMutation.isPending}
                    >
                      <Star className="w-3.5 h-3.5 mr-1.5" />
                      기본 배송지
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-gray-100"
                    onClick={() => {
                      setEditingAddress(address);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(address.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
      </div>
      <AddressDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingAddress(null);
        }}
        editingAddress={editingAddress}
      />
    </>
  );
}

