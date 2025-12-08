"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Eye, Briefcase, Users, Loader2 } from "lucide-react";
import { UserListItemDto, UserQueryDto } from "@/types/admin-user";
import { toast } from "sonner";
import { useAuth } from "@/providers/authProvider";
import UserDetailsModal from "@/components/admin/UserDetailsModal";

export default function UsersPage() {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<"business" | "member">("business");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [users, setUsers] = useState<UserListItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
    });

    // Modal state
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch users from API
    useEffect(() => {
        fetchUsers();
    }, [activeTab, pagination.currentPage, searchTerm, filterStatus]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const query: UserQueryDto = {
                page: pagination.currentPage,
                pageSize: pagination.pageSize,
                search: searchTerm || undefined,
            };

            // Add filters based on active tab
            if (activeTab === "business") {
                query.isBusiness = true;
            } else {
                query.isBusiness = false;
            }

            // Add status filters
            if (filterStatus === "active") {
                query.isActive = true;
            } else if (filterStatus === "inactive") {
                query.isActive = false;
            } else if (filterStatus === "approved") {
                query.applicationStatus = "approved";
            } else if (filterStatus === "pending") {
                query.applicationStatus = "pending";
            }

            // Build query string
            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });

            // Call Next.js API route
            const token = getToken();
            const response = await fetch(`/api/admin/users?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setUsers(result.data.users);
                setPagination(result.data.pagination);
            } else {
                setError(result.message || "Failed to load users");
                toast.error(result.message || "Failed to load users");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
                <p className="text-gray-600 mt-2">전체 사용자 목록을 관리하세요</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => {
                            setActiveTab("business");
                            setPagination(prev => ({ ...prev, currentPage: 1 }));
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "business"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                    >
                        <Briefcase className="w-5 h-5" />
                        <span>Business Users</span>
                        {activeTab === "business" && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                                {pagination.totalCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("member");
                            setPagination(prev => ({ ...prev, currentPage: 1 }));
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "member"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        <span>Member Users</span>
                        {activeTab === "member" && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                                {pagination.totalCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={activeTab === "business" ? "사용자 또는 브랜드 검색..." : "사용자 검색 (이름, 이메일, ID)..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">전체</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            {activeTab === "business" && (
                                <>
                                    <option value="approved">승인됨</option>
                                    <option value="pending">대기중</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    사용자
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    연락처
                                </th>
                                {activeTab === "business" && (
                                    <>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            브랜드
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            신청 상태
                                        </th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    상태
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    가입일
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    작업
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === "business" ? 6 : 4} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-2 text-gray-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={activeTab === "business" ? 6 : 4} className="px-6 py-12 text-center text-red-600">
                                        {error}
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === "business" ? 6 : 4} className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                            <div className="text-xs text-gray-400">ID: {user.userId}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{user.phone}</div>
                                    </td>
                                    {activeTab === "business" && (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {user.brandName || "-"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.applicationStatus === "approved" ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <CheckCircle className="w-3 h-3" />
                                                        승인됨
                                                    </span>
                                                ) : user.applicationStatus === "pending" ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                        대기중
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-6 py-4">
                                        {user.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <CheckCircle className="w-3 h-3" />
                                                활성
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                <XCircle className="w-3 h-3" />
                                                비활성
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.createdAt}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>



                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        총 {pagination.totalCount}명의 {activeTab === "business" ? "비즈니스" : "일반"} 사용자 (페이지 {pagination.currentPage}/{pagination.totalPages})
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                            disabled={pagination.currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            이전
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            다음
                        </button>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            <UserDetailsModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUserId(null);
                }}
                userId={selectedUserId}
                token={getToken()}
                onUserUpdated={fetchUsers}
            />
        </div>
    );
}
