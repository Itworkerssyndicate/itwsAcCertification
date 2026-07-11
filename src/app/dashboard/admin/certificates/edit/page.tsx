'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { getCertificateByCode, updateCertificate, getAllAcademies } from '@/lib/firebase/firestore';
import { logActivity } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GRADES } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

// ============================================
// صفحة تعديل شهادة
// ============================================
export default function EditCertificatePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const certificateCode = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [academies, setAcademies] = useState<any[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any>(null);

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
    isActive: true,
  });

  // ============================================
  // تحميل البيانات
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        // تحميل الأكاديميات
        const academiesData = await getAllAcademies();
        setAcademies(academiesData);

        // تحميل بيانات الشهادة
        if (certificateCode) {
          const certificate = await getCertificateByCode(certificateCode);
          if (certificate) {
            setOriginalData(certificate);
            setFormData({
              studentName: certificate.studentName,
              courseName: certificate.courseName,
              completionDate: certificate.completionDate instanceof Date 
                ? certificate.completionDate.toISOString().split('T')[0]
                : new Date(certificate.completionDate).toISOString().split('T')[0],
              grade: certificate.grade,
              academyId: certificate.academyId,
              branchId: certificate.branchId,
              academyName: certificate.academyName,
              academyLicenseNumber: certificate.academyLicenseNumber,
              isActive: certificate.isActive,
            });

            // تحميل فروع الأكاديمية
            const academy = academiesData.find((a) => a.academyId === certificate.academyId);
            if (academy) {
              setSelectedAcademy(academy);
              setBranches(academy.branches || []);
            }
          } else {
            setError('لم يتم العثور على الشهادة');
            toast.error('لم يتم العثور على الشهادة');
          }
        }
      } catch (error) {
        console.error('Fetch data error:', error);
        setError('حدث خطأ أثناء تحميل البيانات');
        toast.error('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [certificateCode]);

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
      const updateData = {
        studentName: formData.studentName,
        courseName: formData.courseName,
        completionDate: new Date(formData.completionDate),
        grade: formData.grade,
        academyId: formData.academyId,
        branchId: formData.branchId,
        academyName: formData.academyName,
        academyLicenseNumber: formData.academyLicenseNumber,
        updatedBy: user?.uid || 'system',
        isActive: formData.isActive,
      };

      const result = await updateCertificate(certificateCode, updateData);

      if (result.success) {
        setSuccess(true);
        toast.success('تم تحديث الشهادة بنجاح');

        // تسجيل النشاط
        await logActivity({
          userId: user?.uid || 'system',
          userEmail: user?.email || 'system',
          userName: user?.displayName || 'النظام',
          userRole: user?.role || 'admin',
          type: 'update_certificate',
          description: `تحديث شهادة: ${certificateCode}`,
          details: {
            certificateCode: certificateCode,
            studentName: formData.studentName,
            courseName: formData.courseName,
            grade: formData.grade,
            academyName: formData.academyName,
            updatedBy: user?.email || 'system',
            changes: {
              before: {
                studentName: originalData?.studentName,
                courseName: originalData?.courseName,
                grade: originalData?.grade,
              },
              after: {
                studentName: formData.studentName,
                courseName: formData.courseName,
                grade: formData.grade,
              },
            },
          },
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
        });

        // العودة إلى قائمة الشهادات بعد 2 ثانية
        setTimeout(() => {
          router.push('/dashboard/admin/certificates');
        }, 2000);
      } else {
        setError(result.error || 'فشل تحديث الشهادة');
        toast.error(result.error || 'فشل تحديث الشهادة');
      }
    } catch (err: any) {
      console.error('Update certificate error:', err);
      setError(err.message || 'حدث خطأ أثناء تحديث الشهادة');
      toast.error(err.message || 'حدث خطأ أثناء تحديث الشهادة');
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
            <h1 className="text-2xl font-bold text-white">تعديل شهادة</h1>
            <p className="text-sm text-gray-400">
              تحديث بيانات الشهادة - {certificateCode}
            </p>
          </div>
        </div>
      </div>

      {/* نموذج التعديل */}
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

            {/* حالة الشهادة */}
            <Card className="glass p-6">
              <h3 className="text-lg font-bold text-white mb-4">حالة الشهادة</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    value="true"
                    checked={formData.isActive === true}
                    onChange={() => setFormData((prev) => ({ ...prev, isActive: true }))}
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-white">نشطة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    value="false"
                    checked={formData.isActive === false}
                    onChange={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-white">محذوفة</span>
                </label>
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
                    <span className={formData.isActive ? 'text-green-400' : 'text-red-400'}>
                      {formData.isActive ? 'نشطة' : 'محذوفة'}
                    </span>
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
                  <span className="text-sm">تم تحديث الشهادة بنجاح</span>
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
                حفظ التغييرات
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
