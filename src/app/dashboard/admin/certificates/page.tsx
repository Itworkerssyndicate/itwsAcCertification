'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Printer,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  User,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getAllCertificates, deleteCertificate } from '@/lib/firebase/firestore';
import { logActivity } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

// ============================================
// صفحة إدارة الشهادات
// ============================================
export default function CertificatesPage() {
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // ============================================
  // تحميل الشهادات
  // ============================================
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await getAllCertificates();
      setCertificates(data);
      setFilteredCertificates(data);
    } catch (error) {
      console.error('Fetch certificates error:', error);
      toast.error('حدث خطأ أثناء تحميل الشهادات');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // البحث
  // ============================================
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = certificates.filter((cert) =>
        cert.studentName.includes(searchTerm) ||
        cert.certificateCode.includes(searchTerm) ||
        cert.courseName.includes(searchTerm) ||
        cert.academyName.includes(searchTerm)
      );
      setFilteredCertificates(filtered);
    } else {
      setFilteredCertificates(certificates);
    }
  }, [searchTerm, certificates]);

  // ============================================
  // حذف شهادة
  // ============================================
  const handleDelete = async () => {
    if (!selectedCertificate || !user) return;

    try {
      const result = await deleteCertificate(
        selectedCertificate.certificateCode,
        user.uid
      );

      if (result.success) {
        toast.success('تم حذف الشهادة بنجاح');
        
        // تسجيل النشاط
        await logActivity({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          userRole: user.role,
          type: 'delete_certificate',
          description: `حذف شهادة: ${selectedCertificate.certificateCode}`,
          details: {
            certificateCode: selectedCertificate.certificateCode,
            studentName: selectedCertificate.studentName,
            courseName: selectedCertificate.courseName,
            deletedBy: user.email,
          },
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
        });

        setShowDeleteModal(false);
        setSelectedCertificate(null);
        fetchCertificates();
      } else {
        toast.error(result.error || 'فشل حذف الشهادة');
      }
    } catch (error) {
      console.error('Delete certificate error:', error);
      toast.error('حدث خطأ أثناء حذف الشهادة');
    }
  };

  // ============================================
  // طباعة الشهادة
  // ============================================
  const handlePrint = (certificate: any) => {
    // سيتم تنفيذ طباعة الشهادة
    toast.success('جاري تحضير الشهادة للطباعة...');
  };

  // ============================================
  // تحميل الشهادة
  // ============================================
  const handleDownload = (certificate: any) => {
    // سيتم تنفيذ تحميل الشهادة
    toast.success('جاري تحميل الشهادة...');
  };

  // ============================================
  // أعمدة الجدول
  // ============================================
  const columns = [
    {
      key: 'certificateCode',
      label: 'كود الشهادة',
      render: (item: any) => (
        <div>
          <p className="font-mono text-sm text-white">{item.certificateCode}</p>
          <p className="text-xs text-gray-400">{item.studentName}</p>
        </div>
      ),
    },
    {
      key: 'courseName',
      label: 'الدورة',
      render: (item: any) => (
        <div>
          <p className="text-sm text-white">{item.courseName}</p>
          <p className="text-xs text-gray-400">{item.academyName}</p>
        </div>
      ),
    },
    {
      key: 'grade',
      label: 'التقدير',
      render: (item: any) => (
        <span className={`text-sm font-bold ${
          item.grade.startsWith('A') ? 'text-green-500' :
          item.grade.startsWith('B') ? 'text-blue-500' :
          item.grade.startsWith('C') ? 'text-yellow-500' :
          'text-red-500'
        }`}>
          {item.grade}
        </span>
      ),
    },
    {
      key: 'issuedAt',
      label: 'تاريخ الإصدار',
      render: (item: any) => {
        const date = item.issuedAt instanceof Date ? item.issuedAt : new Date(item.issuedAt);
        return <span className="text-sm text-gray-300">{date.toLocaleDateString('ar-EG')}</span>;
      },
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (item: any) => (
        <span className={`text-xs px-2 py-1 rounded-full ${
          item.isActive
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {item.isActive ? 'نشطة' : 'محذوفة'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCertificate(item);
              setShowViewModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handlePrint(item)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={() => handleDownload(item)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-green-400 transition-colors"
          >
            <Download size={16} />
          </button>
          <Link
            href={`/dashboard/admin/certificates/edit/${item.certificateCode}`}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Edit size={16} />
          </Link>
          {isSuperAdmin && (
            <button
              onClick={() => {
                setSelectedCertificate(item);
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
          <h1 className="text-2xl font-bold text-white">إدارة الشهادات</h1>
          <p className="text-sm text-gray-400">إدارة الشهادات الصادرة عن الأكاديميات المعتمدة</p>
        </div>
        <Link href="/dashboard/admin/certificates/add">
          <Button icon={Plus}>
            إضافة شهادة جديدة
          </Button>
        </Link>
      </div>

      {/* شريط البحث */}
      <Card className="glass p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="بحث عن شهادة..."
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
          data={filteredCertificates}
          columns={columns}
          loading={loading}
          emptyMessage="لا توجد شهادات مسجلة"
          searchable={false}
        />
      </Card>

      {/* مودال عرض الشهادة */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedCertificate(null);
        }}
        title="تفاصيل الشهادة"
        size="lg"
      >
        {selectedCertificate && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">كود الشهادة</p>
                <p className="text-white font-mono">{selectedCertificate.certificateCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">اسم الطالب</p>
                <p className="text-white font-medium">{selectedCertificate.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">اسم الدورة</p>
                <p className="text-white font-medium">{selectedCertificate.courseName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">التقدير</p>
                <p className={`text-lg font-bold ${
                  selectedCertificate.grade.startsWith('A') ? 'text-green-500' :
                  selectedCertificate.grade.startsWith('B') ? 'text-blue-500' :
                  selectedCertificate.grade.startsWith('C') ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {selectedCertificate.grade}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">الأكاديمية</p>
                <p className="text-white font-medium">{selectedCertificate.academyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">رقم الاعتماد</p>
                <p className="text-white font-medium">{selectedCertificate.academyLicenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">تاريخ الاجتياز</p>
                <p className="text-white font-medium">
                  {selectedCertificate.completionDate instanceof Date 
                    ? selectedCertificate.completionDate.toLocaleDateString('ar-EG')
                    : new Date(selectedCertificate.completionDate).toLocaleDateString('ar-EG')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">تاريخ الإصدار</p>
                <p className="text-white font-medium">
                  {selectedCertificate.issuedAt instanceof Date 
                    ? selectedCertificate.issuedAt.toLocaleDateString('ar-EG')
                    : new Date(selectedCertificate.issuedAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => handlePrint(selectedCertificate)}
              >
                طباعة
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => handleDownload(selectedCertificate)}
              >
                تحميل
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
          setSelectedCertificate(null);
        }}
        title="تأكيد حذف الشهادة"
      >
        {selectedCertificate && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">هل أنت متأكد من حذف هذه الشهادة؟</p>
                <p className="text-sm text-gray-400">
                  {selectedCertificate.studentName} - {selectedCertificate.certificateCode}
                </p>
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
                  setSelectedCertificate(null);
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
