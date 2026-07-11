'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getAllAcademies, deleteAcademy } from '@/lib/firebase/firestore';
import { logActivity } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

// ============================================
// صفحة إدارة الأكاديميات
// ============================================
export default function AcademiesPage() {
  const { user } = useAuth();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [academies, setAcademies] = useState<any[]>([]);
  const [filteredAcademies, setFilteredAcademies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcademy, setSelectedAcademy] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // ============================================
  // تحميل الأكاديميات
  // ============================================
  useEffect(() => {
    fetchAcademies();
  }, []);

  const fetchAcademies = async () => {
    setLoading(true);
    try {
      const data = await getAllAcademies();
      setAcademies(data);
      setFilteredAcademies(data);
    } catch (error) {
      console.error('Fetch academies error:', error);
      toast.error('حدث خطأ أثناء تحميل الأكاديميات');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // البحث
  // ============================================
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = academies.filter((academy) =>
        academy.name.includes(searchTerm) ||
        academy.licenseNumber.includes(searchTerm) ||
        academy.taxNumber.includes(searchTerm)
      );
      setFilteredAcademies(filtered);
    } else {
      setFilteredAcademies(academies);
    }
  }, [searchTerm, academies]);

  // ============================================
  // حذف أكاديمية
  // ============================================
  const handleDelete = async () => {
    if (!selectedAcademy || !user) return;

    if (!deleteReason.trim()) {
      toast.error('الرجاء إدخال سبب الحذف');
      return;
    }

    try {
      const result = await deleteAcademy(
        selectedAcademy.academyId,
        user.uid,
        deleteReason
      );

      if (result.success) {
        toast.success('تم حذف الأكاديمية بنجاح');
        
        // تسجيل النشاط
        await logActivity({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          userRole: user.role,
          type: 'delete_academy',
          description: `حذف أكاديمية: ${selectedAcademy.name}`,
          details: {
            academyId: selectedAcademy.academyId,
            academyName: selectedAcademy.name,
            licenseNumber: selectedAcademy.licenseNumber,
            reason: deleteReason,
          },
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
        });

        setShowDeleteModal(false);
        setSelectedAcademy(null);
        setDeleteReason('');
        fetchAcademies();
      } else {
        toast.error(result.error || 'فشل حذف الأكاديمية');
      }
    } catch (error) {
      console.error('Delete academy error:', error);
      toast.error('حدث خطأ أثناء حذف الأكاديمية');
    }
  };

  // ============================================
  // أعمدة الجدول
  // ============================================
  const columns = [
    {
      key: 'name',
      label: 'اسم الأكاديمية',
      render: (item: any) => (
        <div>
          <p className="font-medium text-white">{item.name}</p>
          <p className="text-xs text-gray-400">{item.licenseNumber}</p>
        </div>
      ),
    },
    {
      key: 'taxNumber',
      label: 'البطاقة الضريبية',
      render: (item: any) => (
        <span className="text-sm text-gray-300">{item.taxNumber}</span>
      ),
    },
    {
      key: 'branches',
      label: 'الفروع',
      render: (item: any) => (
        <span className="text-sm text-gray-300">{item.branches?.length || 0}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ التسجيل',
      render: (item: any) => {
        const date = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
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
              setSelectedAcademy(item);
              setShowViewModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Eye size={16} />
          </button>
          <Link
            href={`/dashboard/admin/academies/edit/${item.academyId}`}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Edit size={16} />
          </Link>
          {isSuperAdmin && (
            <button
              onClick={() => {
                setSelectedAcademy(item);
                setShowDeleteModal(true);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة الأكاديميات</h1>
          <p className="text-sm text-gray-400">إدارة الأكاديميات المعتمدة من النقابة</p>
        </div>
        <Link href="/dashboard/admin/academies/add">
          <Button icon={Plus}>
            إضافة أكاديمية جديدة
          </Button>
        </Link>
      </div>

      {/* شريط البحث */}
      <Card className="glass p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="بحث عن أكاديمية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={Filter}>
              فلتر
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
          data={filteredAcademies}
          columns={columns}
          loading={loading}
          emptyMessage="لا توجد أكاديميات مسجلة"
          searchable={false}
        />
      </Card>

      {/* مودال عرض الأكاديمية */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAcademy(null);
        }}
        title="تفاصيل الأكاديمية"
        size="lg"
      >
        {selectedAcademy && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">اسم الأكاديمية</p>
                <p className="text-white font-medium">{selectedAcademy.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">الرقم الاعتمادي</p>
                <p className="text-white font-medium">{selectedAcademy.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">البطاقة الضريبية</p>
                <p className="text-white font-medium">{selectedAcademy.taxNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">تاريخ التسجيل</p>
                <p className="text-white font-medium">
                  {selectedAcademy.createdAt instanceof Date 
                    ? selectedAcademy.createdAt.toLocaleDateString('ar-EG')
                    : new Date(selectedAcademy.createdAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-lg font-bold text-white mb-3">الفروع</h4>
              {selectedAcademy.branches && selectedAcademy.branches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedAcademy.branches.map((branch: any) => (
                    <div key={branch.branchId} className="p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary-500" />
                        <span className="font-medium text-white">{branch.governorate}</span>
                        {branch.isMainBranch && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                            الرئيسي
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{branch.address}</p>
                      <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                        <Phone size={12} className="text-gray-500" />
                        {branch.phone}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">لا توجد فروع مسجلة</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* مودال تأكيد الحذف */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAcademy(null);
          setDeleteReason('');
        }}
        title="تأكيد حذف الأكاديمية"
      >
        {selectedAcademy && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">هل أنت متأكد من حذف هذه الأكاديمية؟</p>
                <p className="text-sm text-gray-400">{selectedAcademy.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                سبب الحذف *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="أدخل سبب حذف الأكاديمية"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none h-24"
              />
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
                  setSelectedAcademy(null);
                  setDeleteReason('');
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
