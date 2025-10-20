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

interface ApplicationViewProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApiApplicationResponse | null;
}

export default function ApplicationView({ isOpen, onClose, application }: ApplicationViewProps) {

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
        return "승인됨";
      case "pending":
        return "검토 중";
      case "rejected":
        return "거부됨";
      case "banned":
        return "차단됨";
      default:
        return "알 수 없음";
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
      return JSON.parse(docsString);
    } catch {
      return {};
    }
  };

  if (!application?.application) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>신청서 정보 없음</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">신청서 정보를 찾을 수 없습니다.</p>
          <div className="flex justify-end">
            <Button onClick={onClose}>닫기</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const app = application.application;
  const docs = parseDocs(app.docs || '{}');

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
              <span>신청서 정보</span>
              <p className="text-sm font-normal text-gray-500 mt-1">
                사업자 신청서 상세 정보를 확인하세요
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(app.status)}
                  <span>신청서 상태</span>
                </div>
                <Badge variant={getStatusVariant(app.status)} className="text-sm px-3 py-1">
                  {getStatusText(app.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  신청서 번호: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{app.appCode || app.id}</span>
                </span>
                {(app.status === "pending" || app.status === "rejected") && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {/* TODO: Implement edit */}}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    수정
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Building2 className="h-5 w-5" />
                사업자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    회사명
                  </label>
                  <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg border">
                    {app.businessName}
                  </p>
                </div>
                {app.bizRegNo && (
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-700">사업자등록번호</label>
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
                연락처 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {app.contactName && (
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      담당자명
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
                      연락처
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
                      이메일
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
          {Object.keys(docs).length > 0 && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <FileText className="h-5 w-5" />
                  첨부 서류
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {Object.entries(docs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-gray-500 font-mono break-all">{value as string}</p>
                      </div>
                      <Button variant="outline" size="sm" className="ml-4">
                        <Download className="h-4 w-4 mr-1" />
                        다운로드
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Note */}
          {app.noteAdmin && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  관리자 메모
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-800 leading-relaxed">{app.noteAdmin}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calendar className="h-5 w-5" />
                시간 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">신청일:</span>
                <span className="text-sm text-gray-900 font-mono">{formatDate(app.createdAt)}</span>
              </div>
              {app.decidedAt && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">결정일:</span>
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
                신청서 정보를 수정할 수 있습니다
              </span>
            )}
            {(app.status === "approved" || app.status === "banned") && (
              <span className="flex items-center gap-1 text-gray-400">
                <XCircle className="h-4 w-4" />
                이 신청서는 수정할 수 없습니다
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {(app.status === "pending" || app.status === "rejected") && (
              <Button 
                variant="outline"
                onClick={() => {/* TODO: Implement edit */}}
                className="text-blue-600 hover:text-blue-700"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </Button>
            )}
            <Button onClick={onClose} variant="outline">
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
