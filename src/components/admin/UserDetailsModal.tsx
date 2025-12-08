"use client";

import { useState, useEffect } from "react";
import { X, User as UserIcon, Mail, Phone, Calendar, Shield, CheckCircle, XCircle, Save, Loader2, MessageSquare, Star } from "lucide-react";
import { UserDetailDto, AdminUpdateUserDto } from "@/types/admin-user";
import { toast } from "sonner";

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    token: string | null;
    onUserUpdated: () => void;
}

export default function UserDetailsModal({ isOpen, onClose, userId, token, onUserUpdated }: UserDetailsModalProps) {
    const [user, setUser] = useState<UserDetailDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        isAdmin: false,
        isActive: true,
    });

    // Fetch user details when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            fetchUserDetails();
        }
    }, [isOpen, userId]);

    const fetchUserDetails = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setUser(result.data);
                setFormData({
                    name: result.data.name || "",
                    email: result.data.email || "",
                    phone: result.data.phone || "",
                    isAdmin: result.data.isAdmin || false,
                    isActive: result.data.isActive,
                });
            } else {
                toast.error(result.message || "Failed to load user details");
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            toast.error("Failed to load user details");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!userId) return;

        setSaving(true);
        try {
            const updateData: AdminUpdateUserDto = {};

            // Only include changed fields
            if (formData.name !== user?.name) updateData.name = formData.name;
            if (formData.email !== user?.email) updateData.email = formData.email;
            if (formData.phone !== user?.phone) updateData.phone = formData.phone;
            if (formData.isAdmin !== user?.isAdmin) updateData.isAdmin = formData.isAdmin;
            if (formData.isActive !== user?.isActive) updateData.isActive = formData.isActive;

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: JSON.stringify(updateData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success("User updated successfully");
                setEditMode(false);
                fetchUserDetails(); // Refresh data
                onUserUpdated(); // Refresh parent list
            } else {
                toast.error(result.message || "Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Failed to update user");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async () => {
        if (!userId || !user) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: JSON.stringify({ isActive: !user.isActive }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success(user.isActive ? "User deactivated" : "User activated");
                fetchUserDetails();
                onUserUpdated();
            } else {
                toast.error(result.message || "Failed to update user");
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
            toast.error("Failed to update user");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">User Details</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : user ? (
                        <div className="space-y-6">
                            {/* User Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <UserIcon className="w-4 h-4 inline mr-1" />
                                        Name
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{user.name}</p>
                                    )}
                                </div>

                                {/* User ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                                    <p className="text-gray-600 font-mono text-sm">{user.userId}</p>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Email
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{user.email || "-"}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Phone
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{user.phone || "-"}</p>
                                    )}
                                </div>

                                {/* Created At */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Joined
                                    </label>
                                    <p className="text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>

                                {/* Updated At */}
                                {user.updatedAt && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                                        <p className="text-gray-600">{new Date(user.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-3">
                                {/* Admin Status */}
                                {editMode ? (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isAdmin}
                                            onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Admin Role</span>
                                    </label>
                                ) : (
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.isAdmin ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                                        }`}>
                                        <Shield className="w-3 h-3" />
                                        {user.isAdmin ? "Admin" : "User"}
                                    </span>
                                )}

                                {/* Active Status */}
                                {!editMode && (
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {user.isActive ? "Active" : "Inactive"}
                                    </span>
                                )}
                            </div>

                            {/* Activity Stats */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        {user.reviewCount ?? 0}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Reviews</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                                        <MessageSquare className="w-5 h-5 text-blue-500" />
                                        {user.inquiryCount ?? 0}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Inquiries</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            User not found
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {user && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                onClick={handleToggleActive}
                                disabled={saving}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${user.isActive
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                    } disabled:opacity-50`}
                            >
                                {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {editMode ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setEditMode(false);
                                            // Reset form
                                            setFormData({
                                                name: user.name,
                                                email: user.email || "",
                                                phone: user.phone || "",
                                                isAdmin: user.isAdmin,
                                                isActive: user.isActive,
                                            });
                                        }}
                                        disabled={saving}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={saving}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Edit User
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
