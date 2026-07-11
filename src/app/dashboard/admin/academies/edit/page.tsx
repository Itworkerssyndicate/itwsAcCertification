'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Save,
  X,
  MapPin,
  Phone,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  Edit,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAcademyById, updateAcademy } from '@/lib/firebase/firestore';
import { logActivity } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EGYPTIAN_GOVERNORATES } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

// ============================================
// صفحة تعديل أكاديمية
// ============================================
export default function EditAcademyPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const academyId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ============================================
  // بيانات النموذج
  // ============================================
  const [formData, setFormData] = useState({
    name: '',
    taxNumber: '',
    licenseNumber: '',
  });

  // ============================================
  // بيانات الفروع
  // ============================================
  const [branches, setBranches] = useState<
    Array<{
      branchId: string;
      governorate: string;
      address: string;
      phone: string;
      isMainBranch: boolean;
    }>
  >([]);

  // ============================================
  // تحميل بيانات الأكاديمية
  // ============================================
  useEffect(() => {
    const fetchAcademy = async () => {
      if (!academyId) return;
      
      setFetching(true);
      try {
        const academy = await getAcademyById(academyId);
        if (academy) {
          setFormData({
            name: academy.name,
            taxNumber: academy.taxNumber,
            licenseNumber: academy.licenseNumber,
          });
          setBranches(academy.branches || []);
        } else {
          setError('لم يتم العثور على الأكاديمية');
          toast.error('لم يتم العثور على الأكاديمية');
        }
      } catch (err) {
        console.error('Fetch academy error:', err);
        setError('حدث خطأ أثناء تحميل بيانات الأكاديمية');
        toast.error('حدث خطأ أثناء تحميل بيانات الأكاديمية');
      } finally {
        setFetching(false);
      }
    };

    fetchAcademy();
  }, [academyId]);

  // ============================================
  // إضافة فرع
  // ============================================
  const addBranch = () => {
    const newId = String(Date.now());
    setBranches([
      ...branches,
      {
        branchId: newId,
        governorate: '',
        address: '',
        phone: '',
        isMainBranch: false,
      },
    ]);
  };

  // ============================================
  // حذف فرع
  // ============================================
  const removeBranch = (branchId: string) => {
    if (branches.length <= 1) {
      toast.error('يجب أن يكون هناك فرع واحد على الأقل');
      return;
    }
    setBranches(branches.filter((b) => b.branchId !== branchId));
  };

  // ============================================
  // تحديث بيانات الفرع
  // ============================================
  const updateBranch = (branchId: string, field: string, value: string) => {
    setBranches(
      branches.map((b) =>
        b.branchId === branchId ? { ...b, [field]: value } : b
      )
    );
  };

  // ============================================
  // جعل فرع رئيسي
  // ============================================
  const setMainBranch = (branchId: string) => {
    setBranches(
      branches.map((b) => ({
        ...b,
        isMainBranch: b.branchId === branchId,
      }))
    );
  };

  // ============================================
  // معالجة إرسال النموذج
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // التحقق من البيانات
    if (!formData.name.trim()) {
      setError('الرجاء إدخال اسم الأكاديمية');
      return;
    }
    if (!formData.taxNumber.trim()) {
      setError('الرجاء إدخال رقم البطاقة الضريبية');
      return;
    }
    if (!formData.licenseNumber.trim()) {
      setError('الرجاء إدخال رقم الاعتماد');
      return;
    }

    // التحقق من الفروع
    for (const branch of branches) {
      if (!branch.governorate) {
        setError('الرجاء اختيار المحافظة لجميع الفروع');
        return;
      }
      if (!branch.address.trim()) {
        setError('الرجاء إدخال العنوان لجميع الفروع');
        return;
      }
      if (!branch.phone.trim()) {
        setError('الرجاء إدخال رقم الهاتف لجميع الفروع');
        return;
      }
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        taxNumber: formData.taxNumber,
        licenseNumber: formData.licenseNumber,
        branches: branches,
        updatedBy: user?.uid || 'system',
      };

      const result = await updateAcademy(academyId, updateData);

      if (result.success) {
        setSuccess(true);
        toast.success('تم تحديث الأكاديمية بنجاح');

        // تسجيل النشاط
        await logActivity({
          userId: user?.uid || 'system',
          userEmail: user?.email || 'system',
          userName: user?.displayName || 'النظام',
          userRole: user?.role || 'admin',
          type: 'update_academy',
          description: `تحديث أكاديمية: ${formData.name}`,
          details: {
            academyId: academyId,
            academyName: formData.name,
            licenseNumber: formData.licenseNumber,
            branchesCount: branches.length,
            updatedBy: user?.email || 'system',
          },
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
        });

        // العودة إلى قائمة الأكاديميات بعد 2 ثانية
        setTimeout(() => {
          router.push('/dashboard/admin/academies');
        }, 2000);
      } else {
        setError(result.error || 'فشل تحديث الأكاديمية');
        toast.error(result.error || 'فشل تحديث الأكاديمية');
      }
    } catch (err: any) {
      console.error('Update academy error:', err);
      setError(err.message || 'حدث خطأ أثناء تحديث الأكاديمية');
      toast.error(err.message || 'حدث خطأ أثناء تحديث الأكاديمية');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // تحديث بيانات النموذج
  // ============================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            href="/dashboard/admin/academies"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">تعديل أكاديمية</h1>
            <p className="text-sm text-gray-400">تحديث بيانات الأكاديمية</p>
          </div>
        </div>
      </div>

      {/* نموذج التعديل */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* البيانات الأساسية */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass p-6">
              <h3 className="text-lg font-bold text-white mb-4">البيانات الأساسية</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    اسم الأكاديمية *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="أدخل اسم الأكاديمية"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      رقم البطاقة الضريبية *
                    </label>
                    <Input
                      type="text"
                      name="taxNumber"
                      placeholder="مثال: 234-567-890"
                      value={formData.taxNumber}
                      onChange={handleChange}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      رقم الاعتماد *
                    </label>
                    <Input
                      type="text"
                      name="licenseNumber"
                      placeholder="مثال: NTI-2026-001"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* الفروع */}
            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">الفروع</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBranch}
                  icon={Plus}
                >
                  إضافة فرع
                </Button>
              </div>

              <div className="space-y-4">
                {branches.map((branch, index) => (
                  <motion.div
                    key={branch.branchId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          فرع {index + 1}
                        </span>
                        {branch.isMainBranch ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                            الرئيسي
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setMainBranch(branch.branchId)}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 hover:text-primary-400 transition-colors"
                          >
                            جعل رئيسي
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBranch(branch.branchId)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">المحافظة *</label>
                        <select
                          value={branch.governorate}
                          onChange={(e) => updateBranch(branch.branchId, 'governorate', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                          disabled={loading}
                          required
                        >
                          <option value="">اختر المحافظة</option>
                          {EGYPTIAN_GOVERNORATES.map((gov) => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">رقم الهاتف *</label>
                        <Input
                          type="tel"
                          placeholder="مثال: 0223456789"
                          value={branch.phone}
                          onChange={(e) => updateBranch(branch.branchId, 'phone', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm"
                          disabled={loading}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">العنوان *</label>
                        <Input
                          type="text"
                          placeholder="أدخل العنوان بالتفصيل"
                          value={branch.address}
                          onChange={(e) => updateBranch(branch.branchId, 'address', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            <Card className="glass p-6">
              <h3 className="text-lg font-bold text-white mb-4">ملخص</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">اسم الأكاديمية</span>
                  <span className="text-white">{formData.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">رقم الاعتماد</span>
                  <span className="text-white">{formData.licenseNumber || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">عدد الفروع</span>
                  <span className="text-white">{branches.length}</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">الحالة</span>
                    <span className="text-yellow-400">قيد التعديل</span>
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
                  <span className="text-sm">تم تحديث الأكاديمية بنجاح</span>
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
              <Link href="/dashboard/admin/academies" className="w-full">
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
