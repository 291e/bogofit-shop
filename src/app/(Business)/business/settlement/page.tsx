"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Download,
  Plus,
  Building2,
  Clock,
} from "lucide-react";
import {
  mockSettlementRecords,
  mockSettlementSummary,
  mockCommissionBreakdown,
  mockBankAccounts,
  settlementStatusOptions,
  getStatusBadge,
  formatCurrency,
  formatPercent,
} from "@/contents/Business/settlementData";

export default function SettlementPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  // 필터링된 정산 내역
  const filteredRecords =
    statusFilter === "all"
      ? mockSettlementRecords
      : mockSettlementRecords.filter(
          (record) => record.status === statusFilter
        );

  // 통계 계산
  const completedSettlements = mockSettlementRecords.filter(
    (r) => r.status === "completed"
  ).length;

  // 기본 계좌
  const defaultAccount = mockBankAccounts.find((account) => account.isDefault);

  // 정산 신청 핸들러
  const handleSettlementRequest = () => {
    // 정산 신청 로직 구현
    console.log("정산 신청");
    setIsRequestDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">정산 관리</h1>
          <p className="text-gray-600">매출 정산 현황을 확인하고 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            정산서 다운로드
          </Button>
          <Button onClick={() => setIsRequestDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            정산 신청
          </Button>
        </div>
      </div>

      {/* 정산 현황 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockSettlementSummary.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockSettlementSummary.currentPeriod}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수수료</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{formatCurrency(mockSettlementSummary.totalCommission)}
            </div>
            <p className="text-xs text-muted-foreground">
              평균 {formatPercent(5.0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">정산 예정액</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockSettlementSummary.expectedSettlement)}
            </div>
            <p className="text-xs text-muted-foreground">
              다음 정산: {mockSettlementSummary.nextSettlementDate}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 정산</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSettlements}건</div>
            <p className="text-xs text-muted-foreground">
              총 {formatCurrency(mockSettlementSummary.completedAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 수수료 분류별 현황 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>카테고리별 수수료 현황</CardTitle>
            <CardDescription>카테고리별 매출과 수수료율</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCommissionBreakdown.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <div className="text-right">
                      <div className="text-sm">
                        {formatCurrency(item.sales)}
                      </div>
                      <div className="text-xs text-gray-500">
                        수수료율: {formatPercent(item.commissionRate)}
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={
                      (item.sales /
                        Math.max(
                          ...mockCommissionBreakdown.map((c) => c.sales)
                        )) *
                      100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>수수료: {formatCurrency(item.commission)}</span>
                    <span>
                      실 정산액: {formatCurrency(item.sales - item.commission)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 정산 계좌 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>정산 계좌</CardTitle>
            <CardDescription>등록된 정산 계좌 정보</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBankAccounts.map((account) => (
                <div key={account.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {account.bankName}
                      </span>
                    </div>
                    {account.isDefault && (
                      <Badge
                        variant="default"
                        className="bg-blue-100 text-blue-800"
                      >
                        기본
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>{account.accountNumber}</div>
                    <div>{account.accountHolder}</div>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={
                        account.status === "active" ? "default" : "secondary"
                      }
                      className={
                        account.status === "active"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                    >
                      {account.status === "active" ? "사용중" : "중지"}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                계좌 추가
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 정산 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>정산 내역</CardTitle>
          <CardDescription>
            <div className="flex justify-between items-center">
              <span>월별 정산 현황 및 처리 상태</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  {settlementStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>정산 기간</TableHead>
                  <TableHead className="text-right">총 매출</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead className="text-right">조정액</TableHead>
                  <TableHead className="text-right">정산액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>처리일</TableHead>
                  <TableHead>정산 계좌</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const statusInfo = getStatusBadge(record.status);

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.period}</div>
                          <div className="text-sm text-gray-500">
                            {record.startDate} ~ {record.endDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(record.totalSales)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(record.commission)}
                        <div className="text-xs text-gray-500">
                          ({formatPercent(record.commissionRate)})
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            record.adjustments >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {record.adjustments >= 0 ? "+" : ""}
                          {formatCurrency(record.adjustments)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(record.finalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusInfo.className}
                        >
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.requestDate}</TableCell>
                      <TableCell>
                        {record.processedDate || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{record.bankAccount}</div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>조건에 맞는 정산 내역이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 정산 신청 다이얼로그 */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>정산 신청</DialogTitle>
            <DialogDescription>
              {mockSettlementSummary.currentPeriod} 정산을 신청합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>정산 기간:</span>
                  <span className="font-medium">
                    {mockSettlementSummary.currentPeriod}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>총 매출:</span>
                  <span className="font-medium">
                    {formatCurrency(mockSettlementSummary.totalSales)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>수수료:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(mockSettlementSummary.totalCommission)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>조정액:</span>
                  <span className="font-medium">
                    {formatCurrency(mockSettlementSummary.totalAdjustments)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span className="font-medium">정산 예정액:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(mockSettlementSummary.expectedSettlement)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="text-sm font-medium mb-2">정산 계좌</div>
              {defaultAccount && (
                <div className="text-sm text-gray-600">
                  <div>
                    {defaultAccount.bankName} {defaultAccount.accountNumber}
                  </div>
                  <div>{defaultAccount.accountHolder}</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div className="text-sm text-blue-800">
                정산 신청 후 영업일 기준 3-5일 이내 처리됩니다.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRequestDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleSettlementRequest}>
              <Clock className="h-4 w-4 mr-2" />
              정산 신청
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
