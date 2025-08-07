"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  RefreshCcw,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  Search,
  Phone,
  Image,
  FileText,
} from "lucide-react";
import {
  RefundRequest,
  mockRefundRequests,
  refundTypeOptions,
  refundStatusOptions,
  refundReasonOptions,
  refundMethodOptions,
  getRefundStats,
} from "@/contents/Business/refundData";

export default function RefundsPage() {
  const [refundRequests, setRefundRequests] =
    useState<RefundRequest[]>(mockRefundRequests);
  const [filteredData, setFilteredData] =
    useState<RefundRequest[]>(mockRefundRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [processData, setProcessData] = useState({
    status: "",
    adminNotes: "",
    refundMethod: "",
    bankAccount: "",
  });

  // 필터링 로직
  useEffect(() => {
    let filtered = refundRequests;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.orderNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 타입 필터
    if (typeFilter !== "all") {
      filtered = filtered.filter((request) => request.type === typeFilter);
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [refundRequests, searchTerm, typeFilter, statusFilter]);

  // 요청 처리 핸들러
  const handleProcessRequest = () => {
    if (!selectedRequest) return;

    const updatedRequests = refundRequests.map((request) => {
      if (request.id === selectedRequest.id) {
        const updatedRequest = {
          ...request,
          status: processData.status as RefundRequest["status"],
          adminNotes: processData.adminNotes || undefined,
          processedDate: new Date().toISOString().split("T")[0],
        };

        // 승인된 경우 환불 방법 추가
        if (
          processData.status === "approved" ||
          processData.status === "completed"
        ) {
          updatedRequest.refundMethod =
            processData.refundMethod as RefundRequest["refundMethod"];
          if (
            processData.refundMethod === "bank_transfer" &&
            processData.bankAccount
          ) {
            updatedRequest.bankAccount = processData.bankAccount;
          }
        }

        return updatedRequest;
      }
      return request;
    });

    setRefundRequests(updatedRequests);
    setIsProcessDialogOpen(false);
    setSelectedRequest(null);
    setProcessData({
      status: "",
      adminNotes: "",
      refundMethod: "",
      bankAccount: "",
    });
  };

  // 상태별 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            접수대기
          </Badge>
        );
      case "reviewing":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            검토중
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            승인
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">거부</Badge>;
      case "processing":
        return (
          <Badge variant="default" className="bg-orange-100 text-orange-800">
            처리중
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-emerald-100 text-emerald-800">
            완료
          </Badge>
        );
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  // 타입별 배지 색상
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "return":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            반품
          </Badge>
        );
      case "exchange":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200"
          >
            교환
          </Badge>
        );
      case "refund":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            환불
          </Badge>
        );
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  // 사유 표시
  const getReasonLabel = (reason: string) => {
    const reasonOption = refundReasonOptions.find(
      (option) => option.value === reason
    );
    return reasonOption ? reasonOption.label : reason;
  };

  // 통계 계산
  const stats = getRefundStats(refundRequests);

  // 상세보기 다이얼로그 열기
  const openDetailDialog = (request: RefundRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  // 처리 다이얼로그 열기
  const openProcessDialog = (request: RefundRequest) => {
    setSelectedRequest(request);
    setProcessData({
      status: request.status,
      adminNotes: request.adminNotes || "",
      refundMethod: request.refundMethod || "",
      bankAccount: request.bankAccount || "",
    });
    setIsProcessDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">반품/환불 관리</h1>
        <p className="text-gray-600">
          고객의 반품/환불 요청을 확인하고 처리하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 요청</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">처리 대기</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending + stats.reviewing}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인/완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved + stats.completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">환불 총액</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₩{stats.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 반품/환불 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>반품/환불 목록</CardTitle>
          <CardDescription>
            고객의 반품/환불 요청을 확인하고 처리하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="주문번호, 고객명, 상품명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="타입 필터" />
              </SelectTrigger>
              <SelectContent>
                {refundTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                {refundStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>요청정보</TableHead>
                  <TableHead>고객정보</TableHead>
                  <TableHead>상품정보</TableHead>
                  <TableHead>사유</TableHead>
                  <TableHead className="text-right">환불금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          요청일: {request.requestDate}
                        </div>
                        {request.processedDate && (
                          <div className="text-sm text-gray-500">
                            처리일: {request.processedDate}
                          </div>
                        )}
                        <div className="mt-1">{getTypeBadge(request.type)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.customerName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {request.customerPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.productName}</div>
                        <div className="text-sm text-gray-500">
                          수량: {request.quantity}개
                        </div>
                        <div className="text-sm text-gray-500">
                          원가: ₩{request.originalPrice.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">
                          {getReasonLabel(request.reason)}
                        </div>
                        {request.reasonDetail && (
                          <div className="text-sm text-gray-500 max-w-32 truncate">
                            {request.reasonDetail}
                          </div>
                        )}
                        {request.attachedImages &&
                          request.attachedImages.length > 0 && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Image className="h-3 w-3 mr-1" />
                              {request.attachedImages.length}개 첨부
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ₩{request.refundAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailDialog(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          상세
                        </Button>
                        {(request.status === "pending" ||
                          request.status === "reviewing") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProcessDialog(request)}
                          >
                            <RefreshCcw className="h-4 w-4 mr-1" />
                            처리
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <RefreshCcw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>조건에 맞는 요청이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세보기 다이얼로그 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>반품/환불 요청 상세</DialogTitle>
            <DialogDescription>
              요청 ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">주문번호</Label>
                  <p className="text-sm">{selectedRequest.orderNumber}</p>
                </div>
                <div>
                  <Label className="font-medium">요청타입</Label>
                  <div className="mt-1">
                    {getTypeBadge(selectedRequest.type)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">고객명</Label>
                  <p className="text-sm">{selectedRequest.customerName}</p>
                </div>
                <div>
                  <Label className="font-medium">연락처</Label>
                  <p className="text-sm">{selectedRequest.customerPhone}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">상품정보</Label>
                <div className="text-sm space-y-1">
                  <p>상품명: {selectedRequest.productName}</p>
                  <p>수량: {selectedRequest.quantity}개</p>
                  <p>원가: ₩{selectedRequest.originalPrice.toLocaleString()}</p>
                  <p>
                    환불금액: ₩{selectedRequest.refundAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="font-medium">사유</Label>
                <div className="text-sm space-y-1">
                  <p>분류: {getReasonLabel(selectedRequest.reason)}</p>
                  <p>상세사유: {selectedRequest.reasonDetail}</p>
                </div>
              </div>

              {selectedRequest.attachedImages &&
                selectedRequest.attachedImages.length > 0 && (
                  <div>
                    <Label className="font-medium">첨부파일</Label>
                    <div className="text-sm">
                      {selectedRequest.attachedImages.map((image, index) => (
                        <p key={index} className="flex items-center">
                          <Image className="h-4 w-4 mr-2" />
                          {image}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              {selectedRequest.refundMethod && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">환불방법</Label>
                    <p className="text-sm">
                      {
                        refundMethodOptions.find(
                          (option) =>
                            option.value === selectedRequest.refundMethod
                        )?.label
                      }
                    </p>
                  </div>
                  {selectedRequest.bankAccount && (
                    <div>
                      <Label className="font-medium">계좌정보</Label>
                      <p className="text-sm">{selectedRequest.bankAccount}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedRequest.adminNotes && (
                <div>
                  <Label className="font-medium">관리자 메모</Label>
                  <p className="text-sm">{selectedRequest.adminNotes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">요청일</Label>
                  <p className="text-sm">{selectedRequest.requestDate}</p>
                </div>
                {selectedRequest.processedDate && (
                  <div>
                    <Label className="font-medium">처리일</Label>
                    <p className="text-sm">{selectedRequest.processedDate}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="font-medium">현재상태</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 요청 처리 다이얼로그 */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>요청 처리</DialogTitle>
            <DialogDescription>
              {selectedRequest?.orderNumber} 요청을 처리합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>처리 상태</Label>
              <Select
                value={processData.status}
                onValueChange={(value) =>
                  setProcessData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="처리 상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  {refundStatusOptions
                    .filter(
                      (option) =>
                        option.value !== "all" && option.value !== "pending"
                    )
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {(processData.status === "approved" ||
              processData.status === "completed") && (
              <>
                <div className="space-y-2">
                  <Label>환불 방법</Label>
                  <Select
                    value={processData.refundMethod}
                    onValueChange={(value) =>
                      setProcessData((prev) => ({
                        ...prev,
                        refundMethod: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="환불 방법 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {refundMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {processData.refundMethod === "bank_transfer" && (
                  <div className="space-y-2">
                    <Label>계좌 정보</Label>
                    <Input
                      value={processData.bankAccount}
                      onChange={(e) =>
                        setProcessData((prev) => ({
                          ...prev,
                          bankAccount: e.target.value,
                        }))
                      }
                      placeholder="환불 계좌 정보를 입력하세요"
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>관리자 메모</Label>
              <Textarea
                value={processData.adminNotes}
                onChange={(e) =>
                  setProcessData((prev) => ({
                    ...prev,
                    adminNotes: e.target.value,
                  }))
                }
                placeholder="처리 관련 메모를 입력하세요"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProcessDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleProcessRequest}
              disabled={!processData.status}
            >
              처리 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
