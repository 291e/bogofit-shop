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
  FileText,
} from "lucide-react";

// 실제 DB 타입 정의
interface ExchangeRefundData {
  id: string;
  orderId: string;
  type: "EXCHANGE" | "REFUND";
  status:
    | "PENDING"
    | "REVIEWING"
    | "APPROVED"
    | "REJECTED"
    | "PROCESSING"
    | "COMPLETED";
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string | null;
  reason: string;
  description: string | null;
  adminNotes: string | null;
  processedAt: string | null;
  processedBy: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: Array<{
      id: number;
      quantity: number;
      unitPrice: number;
      product: {
        id: number;
        title: string;
        images: string[];
      } | null;
    }>;
  };
}

// 필터 옵션들
const typeOptions = [
  { value: "all", label: "전체" },
  { value: "EXCHANGE", label: "교환" },
  { value: "REFUND", label: "반품/환불" },
];

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "PENDING", label: "접수대기" },
  { value: "REVIEWING", label: "검토중" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "거부" },
  { value: "PROCESSING", label: "처리중" },
  { value: "COMPLETED", label: "완료" },
];

export default function RefundsPage() {
  const [exchangeRefunds, setExchangeRefunds] = useState<ExchangeRefundData[]>(
    []
  );
  const [filteredData, setFilteredData] = useState<ExchangeRefundData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] =
    useState<ExchangeRefundData | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [processData, setProcessData] = useState({
    status: "",
    adminNotes: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    fetchExchangeRefunds();
  }, []);

  const fetchExchangeRefunds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/business/exchange-refunds");
      const result = await response.json();

      if (result.success) {
        setExchangeRefunds(result.data);
      } else {
        console.error("교환/반품 데이터 로드 실패:", result.error);
      }
    } catch (error) {
      console.error("교환/반품 데이터 로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링 로직
  useEffect(() => {
    let filtered = exchangeRefunds;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.order.orderNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.applicantName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.order.items.some((item) =>
            item.product?.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
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
  }, [exchangeRefunds, searchTerm, typeFilter, statusFilter]);

  // 요청 처리 핸들러
  const handleProcessRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch("/api/business/exchange-refunds", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: processData.status,
          adminNotes: processData.adminNotes || null,
          processedBy: "admin", // TODO: 실제 로그인된 관리자 ID로 변경
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 성공 시 데이터 새로고침
        await fetchExchangeRefunds();
        setIsProcessDialogOpen(false);
        setSelectedRequest(null);
        setProcessData({
          status: "",
          adminNotes: "",
        });
        alert("처리가 완료되었습니다.");
      } else {
        alert(result.error || "처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("처리 오류:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  // 상태별 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            접수대기
          </Badge>
        );
      case "REVIEWING":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            검토중
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            승인
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">거부</Badge>;
      case "PROCESSING":
        return (
          <Badge variant="default" className="bg-orange-100 text-orange-800">
            처리중
          </Badge>
        );
      case "COMPLETED":
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
      case "REFUND":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            반품/환불
          </Badge>
        );
      case "EXCHANGE":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200"
          >
            교환
          </Badge>
        );
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  // 통계 계산
  const stats = {
    total: exchangeRefunds.length,
    pending: exchangeRefunds.filter((r) => r.status === "PENDING").length,
    reviewing: exchangeRefunds.filter((r) => r.status === "REVIEWING").length,
    approved: exchangeRefunds.filter((r) => r.status === "APPROVED").length,
    completed: exchangeRefunds.filter((r) => r.status === "COMPLETED").length,
    totalAmount: exchangeRefunds.reduce(
      (sum, r) => sum + r.order.totalAmount,
      0
    ),
  };

  // 상세보기 다이얼로그 열기
  const openDetailDialog = (request: ExchangeRefundData) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  // 처리 다이얼로그 열기
  const openProcessDialog = (request: ExchangeRefundData) => {
    setSelectedRequest(request);
    setProcessData({
      status: request.status,
      adminNotes: request.adminNotes || "",
    });
    setIsProcessDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCcw className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">교환/반품 관리</h1>
        <p className="text-gray-600">
          고객의 교환/반품 요청을 확인하고 처리하세요
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
            <CardTitle className="text-sm font-medium">총 금액</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₩{stats.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 교환/반품 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>교환/반품 목록</CardTitle>
          <CardDescription>
            고객의 교환/반품 요청을 확인하고 처리하세요
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
                {typeOptions.map((option) => (
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
                {statusOptions.map((option) => (
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
                  <TableHead className="text-right">금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          요청일:{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        {request.processedAt && (
                          <div className="text-sm text-gray-500">
                            처리일:{" "}
                            {new Date(request.processedAt).toLocaleDateString()}
                          </div>
                        )}
                        <div className="mt-1">{getTypeBadge(request.type)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.applicantName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {request.applicantPhone}
                        </div>
                        {request.applicantEmail && (
                          <div className="text-sm text-gray-500">
                            {request.applicantEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.order.items
                            .map((item) => item.product?.title)
                            .join(", ")}
                        </div>
                        <div className="text-sm text-gray-500">
                          총{" "}
                          {request.order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}
                          개
                        </div>
                        <div className="text-sm text-gray-500">
                          주문금액: ₩
                          {request.order.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">
                          {request.reason}
                        </div>
                        {request.description && (
                          <div className="text-sm text-gray-500 max-w-32 truncate">
                            {request.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ₩{request.order.totalAmount.toLocaleString()}
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
                        {(request.status === "PENDING" ||
                          request.status === "REVIEWING") && (
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
            <DialogTitle>교환/반품 요청 상세</DialogTitle>
            <DialogDescription>
              요청 ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">주문번호</Label>
                  <p className="text-sm">{selectedRequest.order.orderNumber}</p>
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
                  <Label className="font-medium">신청자명</Label>
                  <p className="text-sm">{selectedRequest.applicantName}</p>
                </div>
                <div>
                  <Label className="font-medium">연락처</Label>
                  <p className="text-sm">{selectedRequest.applicantPhone}</p>
                </div>
              </div>

              {selectedRequest.applicantEmail && (
                <div>
                  <Label className="font-medium">이메일</Label>
                  <p className="text-sm">{selectedRequest.applicantEmail}</p>
                </div>
              )}

              <div>
                <Label className="font-medium">상품정보</Label>
                <div className="text-sm space-y-1">
                  {selectedRequest.order.items.map((item, index) => (
                    <div key={index}>
                      <p>상품명: {item.product?.title || "상품명 없음"}</p>
                      <p>수량: {item.quantity}개</p>
                      <p>단가: ₩{item.unitPrice.toLocaleString()}</p>
                    </div>
                  ))}
                  <p>
                    총 주문금액: ₩
                    {selectedRequest.order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="font-medium">사유</Label>
                <div className="text-sm space-y-1">
                  <p>분류: {selectedRequest.reason}</p>
                  {selectedRequest.description && (
                    <p>상세사유: {selectedRequest.description}</p>
                  )}
                </div>
              </div>

              {selectedRequest.adminNotes && (
                <div>
                  <Label className="font-medium">관리자 메모</Label>
                  <p className="text-sm">{selectedRequest.adminNotes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">요청일</Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedRequest.processedAt && (
                  <div>
                    <Label className="font-medium">처리일</Label>
                    <p className="text-sm">
                      {new Date(selectedRequest.processedAt).toLocaleString()}
                    </p>
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
              {selectedRequest?.order.orderNumber} 요청을 처리합니다.
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
                  {statusOptions
                    .filter(
                      (option) =>
                        option.value !== "all" &&
                        option.value !== "PENDING" &&
                        option.value !== selectedRequest?.status
                    )
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

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
