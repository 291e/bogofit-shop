"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  userId: string;
  email: string;
  name: string;
  phoneNumber?: string;
  isAdmin: boolean;
  isBusiness: boolean;
  createdAt: string;
  brand?: {
    id: number;
    name: string;
    status: string;
  };
  _count: {
    orders: number;
    reviews: number;
  };
}

interface AdminUserManagementProps {
  currentUserId?: string;
}

export default function AdminUserManagement({
  currentUserId,
}: AdminUserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;

  // 새 사용자 생성 폼
  const [newUser, setNewUser] = useState({
    userId: "",
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    isAdmin: false,
    isBusiness: false,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[AdminUserManagement] 사용자 목록 조회 시작");
      const params = new URLSearchParams({
        search: userSearch,
        filter: userFilter,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: "include",
      });

      console.log(
        "[AdminUserManagement] API 응답:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("[AdminUserManagement] API 오류:", errorData);
        throw new Error(`사용자 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log("[AdminUserManagement] 받은 데이터:", data);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalUsers(data.pagination?.total || 0);
    } catch (error) {
      console.error("사용자 목록 조회 오류:", error);
      toast.error("사용자 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [userSearch, userFilter, currentPage, itemsPerPage]);

  const handleCreateUser = async () => {
    try {
      if (
        !newUser.userId ||
        !newUser.email ||
        !newUser.password ||
        !newUser.name
      ) {
        toast.error("필수 필드를 모두 입력해주세요");
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "사용자 생성 실패");
      }

      toast.success("사용자가 성공적으로 생성되었습니다");
      setCreateUserDialogOpen(false);
      setNewUser({
        userId: "",
        email: "",
        password: "",
        name: "",
        phoneNumber: "",
        isAdmin: false,
        isBusiness: false,
      });
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "사용자 생성에 실패했습니다";
      console.error("사용자 생성 오류:", error);
      toast.error(errorMessage);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "사용자 수정 실패");
      }

      toast.success("사용자 정보가 성공적으로 수정되었습니다");
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "사용자 수정에 실패했습니다";
      console.error("사용자 수정 오류:", error);
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("정말로 이 사용자를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "사용자 삭제 실패");
      }

      toast.success("사용자가 성공적으로 삭제되었습니다");
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "사용자 삭제에 실패했습니다";
      console.error("사용자 삭제 오류:", error);
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.isAdmin) {
      return <Badge variant="destructive">관리자</Badge>;
    }
    if (user.isBusiness) {
      return <Badge variant="default">사업자</Badge>;
    }
    return <Badge variant="secondary">일반</Badge>;
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">사용자 관리</h2>
        <Dialog
          open={createUserDialogOpen}
          onOpenChange={setCreateUserDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              사용자 생성
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 사용자 생성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userId">사용자 ID</Label>
                <Input
                  id="userId"
                  value={newUser.userId}
                  onChange={(e) =>
                    setNewUser({ ...newUser, userId: e.target.value })
                  }
                  placeholder="사용자 ID를 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="이메일을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">전화번호 (선택)</Label>
                <Input
                  id="phoneNumber"
                  value={newUser.phoneNumber}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phoneNumber: e.target.value })
                  }
                  placeholder="전화번호를 입력하세요"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newUser.isAdmin}
                    onChange={(e) =>
                      setNewUser({ ...newUser, isAdmin: e.target.checked })
                    }
                  />
                  <span>관리자</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newUser.isBusiness}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        isBusiness: e.target.checked,
                      })
                    }
                  />
                  <span>사업자</span>
                </label>
              </div>
              <Button onClick={handleCreateUser} className="w-full">
                사용자 생성
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="사용자 검색..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="admin">관리자</SelectItem>
            <SelectItem value="business">사업자</SelectItem>
            <SelectItem value="regular">일반 사용자</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "검색 중..." : "검색"}
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사용자 ID</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>주문 수</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.userId}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getStatusBadge(user)}</TableCell>
                <TableCell>{user._count.orders}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateUser(user.id, {
                          isBusiness: !user.isBusiness,
                        })
                      }
                    >
                      {user.isBusiness ? "일반화" : "사업자화"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUserId}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              전체 {totalUsers}명 중{" "}
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalUsers)}-
              {Math.min(currentPage * itemsPerPage, totalUsers)}명 표시
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                이전
              </Button>

              {/* 페이지 번호 */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
