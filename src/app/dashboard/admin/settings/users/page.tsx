'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Shield,
  User,
  Mail,
  Phone,
  MoreVertical,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  Lock,
  Unlock,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { logActivity } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

// ============================================
// صفحة إدارة المستخدمين
// ============================================
export default function UsersPage() {
  const { user, isSuperAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('admin');

  // ============================================
  // التحقق من الصلاحية
  // ============================================
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">غير مصرح</h2>
        <p className="text-gray-400">هذه الصفحة متاحة فقط للسوبر أدمن</p>
        <Link href="/dashboard/admin" className="mt-4">
          <Button variant="outline">العودة إلى لوحة التحكم</Button>
        </Link>
      </div>
    );
  }

  // ============================================
  // تحميل المستخدمين
  // ============================================
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(usersQuery);
      
      const usersData: any[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('حدث خطأ أثناء تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // البحث
  // ============================================
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter((u) =>
        u.displayName?.includes(searchTerm) ||
        u.email?.includes(searchTerm) ||
        u.phone?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // ============================================
  // تغيير دور المستخدم
  // ============================================
  const handleRoleChange = async () => {
    if (!selectedUser || !user) return;

    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date(),
      });

      toast.success('تم تغيير دور المستخدم بنجاح');
      
      // تسجيل النشاط
      await logActivity({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        userRole: user.role,
        type: 'user_update',
        description: `تغيير دور المستخدم ${selectedUser.email}`,
        details: {
          userEmail: selectedUser.email,
          oldRole: selectedUser.role,
          newRole: newRole,
          changedBy: user.email,
        },
        ipAddress: 'auto',
        userAgent: navigator.userAgent,
      });

      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Change role error:', error);
      toast.error('حدث خطأ أثناء تغيير دور المستخدم');
    }
  };

  // ============================================
  // حذف مستخدم
  // ============================================
  const handleDelete = async () => {
    if (!selectedUser || !user) return;

    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: user.uid,
      });

      toast.success('تم حذف المستخدم بنجاح');
      
      // تسجيل النشاط
      await logActivity({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        userRole: user.role,
        type: 'user_delete',
        description: `حذف مستخدم ${selectedUser.email}`,
        details: {
          userEmail: selectedUser.email,
          deletedBy: user.email,
        },
        ipAddress: 'auto',
        userAgent: navigator.userAgent,
      });

      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('حدث خطأ أثناء حذف المستخدم');
    }
  };

  // ============================================
  // أعمدة الجدول
  // ============================================
  const columns = [
    {
      key: 'displayName',
      label: 'الاسم',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
            {item.displayName?.charAt(0) || 'م'}
          </div>
          <div>
            <p className="text-sm text-white">{item.displayName}</p>
            <p className="text-xs text-gray-400">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'رقم الهاتف',
      render: (item: any) => (
        <span className="text-sm text-gray-300">{item.phone || '-'}</span>
      ),
    },
    {
      key: 'role',
      label: 'الدور',
      render: (item: any) => (
        <span className={`text-xs px-2 py-1 rounded-full ${
          item.role === 'super_admin'
            ? 'bg-purple-500/20 text-purple-400'
            : 'bg-primary-500/20 text-primary-400'
        }`}>
          {item.role === 'super_admin' ? 'سوبر أدمن' : 'أدمن'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (item: any) => (
        <span className={`text-xs px-2 py-1 rounded-full ${
          item.isActive !== false
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {item.isActive !== false ? 'نشط' : 'محذوف'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ التسجيل',
      render: (item: any) => {
        const date = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        return <span className="text-sm text-gray-300">{date.toLocaleDateString('ar-EG')}</span>;
      },
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedUser(item);
              setNewRole(item.role);
              setShowRoleModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
            disabled={item.id === user?.uid}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedUser(item);
              setShowDeleteModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
            disabled={item.id === user?.uid}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة المستخدمين</h1>
          <p className="text-sm text-gray-400">إدارة المستخدمين وصلاحياتهم</p>
        </div>
        <Link href="/auth/register">
          <Button icon={UserPlus}>
            إضافة مستخدم جديد
          </Button>
        </Link>
      </div>

      {/* شريط البحث */}
      <Card className="glass p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="بحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={RefreshCw} onClick={fetchUsers}>
              تحديث
            </Button>
            <Button variant="outline" icon={Download}>
              تصدير
            </Button>
          </div>
        </div>
      </Card>

      {/* الجدول */}
      <Card className="glass p-6">
        <Table
          data={filteredUsers}
          columns={columns}
          loading={loading}
          emptyMessage="لا توجد مستخدمين مسجلين"
          searchable={false}
        />
      </Card>

      {/* مودال تغيير الدور */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        title="تغيير دور المستخدم"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-gray-400">المستخدم</p>
              <p className="text-white font-medium">{selectedUser.displayName}</p>
              <p className="text-sm text-gray-400">{selectedUser.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                الدور الجديد
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              >
                <option value="admin">أدمن</option>
                <option value="super_admin">سوبر أدمن</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleRoleChange}
                icon={Shield}
                fullWidth
              >
                تغيير الدور
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                fullWidth
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* مودال تأكيد الحذف */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title="تأكيد حذف المستخدم"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">هل أنت متأكد من حذف هذا المستخدم؟</p>
                <p className="text-sm text-gray-400">{selectedUser.displayName} - {selectedUser.email}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDelete}
                icon={Trash2}
                fullWidth
              >
                تأكيد الحذف
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                fullWidth
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
