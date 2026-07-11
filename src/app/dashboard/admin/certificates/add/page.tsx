'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Save,
  X,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Award,
  Building2,
  Search,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { addCertificate, getAllAcademies } from '@/lib/firebase/firestore';
import { logActivity } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GRADES } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

// ============================================
// صفحة إضافة شهادة جديدة
// ============================================
export default function AddCertificatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [academies, setAcademies] = useState<any[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);

  // ============================================
  // بيانات النموذج
  // ============================================
  const [formData, setFormData] = useState({
    studentName: '',
    courseName: '',
    completionDate: '',
    grade: '',
    academyId: '',
    branchId: '',
    academyName: '',
    academyLicenseNumber: '',
  });

  // ============================================
  // تحميل الأكاديميات
  // ============================================
  useEffect(() => {
    const fetchAcademies = async () => {
      setFetching(true);
      try {
        const data = await getAllAcademies();
        setAcademies(data);
      } catch (error) {
        console.error('Fetch academies error:', error);
        toast.error('حدث خطأ أثناء تحميل الأكاديميات');
      } finally {
        setFetching(false);
      }
    };

    fetchAcademies();
  }, []);

  // ============================================
  // تحديث الفروع عند اختيار أكاديمية
  // ============================================
  useEffect(() => {
    if (formData.academyId) {
      const academy = academies.find((a) => a.academyId === formData.academyId);
      if (academy) {
        setSelectedAcademy(academy);
        setBranches(academy.branches || []);
        setFormData((prev) => ({
          ...prev,
          academyName: academy.name,
          academyLicenseNumber: academy.licenseNumber,
        }));
      }
    } else {
      setSelectedAcademy(null);
      setBranches([]);
      setFormData((prev) => ({
        ...prev,
        academyName: '',
        academyLicenseNumber: '',
        branchId: '',
      }));
    }
  }, [formData.academyId, academies]);

  // ============================================
  // معالجة إرسال النموذج
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // التحقق من البيانات
    if (!formData.studentName.trim()) {
      setError('الرجاء إدخال اسم الطالب');
      return;
    }
    if (!formData.courseName.trim()) {
      setError('الرجاء إدخال اسم الدورة التدريبية');
      return;
    }
    if (!formData.completionDate) {
      setError('الرجاء اختيار تاريخ الاجتياز');
      return;
    }
    if (!formData.grade) {
      setError('الرجاء اختيار التقدير');
      return;
    }
    if (!formData.academyId) {
      setError('الرجاء اختيار الأكاديمية');
      return;
    }
    if (!formData.branchId) {
      setError('الرجاء اختيار الفرع');
      return;
    }

    setLoading(true);
    try {
      const certificateData = {
        studentName: formData.studentName,
        courseName: formData.courseName,
        completionDate: new Date(formData.completionDate),
        grade: formData.grade,
        academyId: formData.academyId,
        branchId: formData.branchId,
        academyName: formData.academyName,
        academyLicenseNumber: formData.academyLicenseNumber,
        issuedBy: user?.uid || 'system',
        updatedBy: user?.uid || 'system',
        isActive: true,
      };

      const result = await addCertificate(certificateData);

      if (result.success) {
        setSuccess(true);
        toast.success('تم إضافة الشهادة بنجاح');

        // تسجيل النشاط
        await logActivity({
          userId: user?.uid || 'system',
          userEmail: user?.email || 'system',
          userName: user?.displayName || 'النظام',
          userRole: user?.role || 'admin',
          type: 'create_certificate',
          description: `إضافة شهادة جديدة: ${formData.studentName}`,
          details: {
            certificateCode: result.certificateCode,
            studentName: formData.studentName,
            courseName: formData.courseName,
            grade: formData.grade,
            academyName: formData.academyName,
            issuedBy: user?.email || 'system',
          },
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
        });

        // إعادة تعيين النموذج بعد 2 ثانية
        setTimeout(() => {
          router.push('/dashboard/admin/certificates');
        }, 2000);
      } else {
        setError(result.error || 'فشل إضافة الشهادة');
        toast.error(result.error || 'فشل إضافة الشهادة');
      }
    } catch (err: any) {
      console.error('Add certificate error:', err);
      setError(err.message || 'حدث خطأ أثناء إضافة الشهادة');
      toast.error(err.message || 'حدث خطأ أثناء إضافة الشهادة');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // تحديث بيانات النموذج
  // ============================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ============================================
  // حالة التحميل
  // ============================================
  if (fetching) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/certificates"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">إضافة شهادة جديدة</h1>
            <p className="text-sm text-gray-400">إضافة شهادة جديدة إلى نظام النقابة</p>
          </div>
        </div>
      </div>

      {/* نموذج الإضافة */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* البيانات الأساسية */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass p-6">
              <h3 className="text-lg font-bold text-white mb-4">بيانات الشهادة</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    اسم الطالب *
                  </label>
                  <Input
                    type="text"
                    name="studentName"
                    placeholder="أدخل اسم الطالب بالكامل"
                    value={formData.studentName}
                    onChange={handleChange}
                    icon={User}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    اسم الدورة التدريبية *
                  </label>
                  <Input
                    type="text"
                    name="courseName"
                    placeholder="أدخل اسم الدورة التدريبية"
                    value={formData.courseName}
                    onChange={handleChange}
                    icon={Award}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      تاريخ الاجتياز *
                    </label>
                    <Input
                      type="date"
                      name="completionDate"
                      value={formData.completionDate}
                      onChange={handleChange}
                      icon={Calendar}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      التقدير *
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      disabled={loading}
                      required
                    >
                      <option value="">اختر التقدير</option>
                      {GRADES.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* بيانات الأكاديمية */}
            <Card className="glass p-6">
              <h3 className="text-lg font-bold text-white mb-4">بيانات الأكاديمية</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    الأكاديمية *
                  </label>
                  <select
                    name="academyId"
                    value={formData.academyId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    disabled={loading}
                    required
                  >
                    <option value="">اختر الأكاديمية</option>
                    {academies.map((academy) => (
                      <option key={academy.academyId} value={academy.academyId}>
                        {academy.name} - {academy.licenseNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {branches.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      الفرع *
                    </label>
                    <select
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      disabled={loading}
                      required
                    >
                      <option value="">اختر الفرع</option>
                      {branches.map((branch) => (
                        <option key={branch.branchId} value={branch.branchId}>
                          {branch.governorate} - {branch.address}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedAcademy && (
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">اسم الأكاديمية:</span>
                        <span className="text-white mr-2">{selectedAcademy.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">رقم الاعتماد:</span>
                        <span className="text-white mr-2">{selectedAcademy.licenseNumber}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            <Card className="glass p-6">
              <h3 className="text-lg font-bold text-white mb-4">ملخص</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">الطالب</span>
                  <span className="text-white">{formData.studentName || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">الدورة</span>
                  <span className="text-white">{formData.courseName || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">التقدير</span>
                  <span className="text-white">{formData.grade || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">الأكاديمية</span>
                  <span className="text-white">{formData.academyName || '-'}</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">الحالة</span>
                    <span className="text-green-400">جديد</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* رسائل الخطأ والنجاح */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
              >
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={18} />
                  <span className="text-sm">تم إضافة الشهادة بنجاح</span>
                </div>
              </motion.div>
            )}

            {/* أزرار الإجراء */}
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                loading={loading}
                icon={Save}
                fullWidth
                size="lg"
              >
                حفظ الشهادة
              </Button>
              <Link href="/dashboard/admin/certificates" className="w-full">
                <Button variant="outline" fullWidth>
                  إلغاء
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
