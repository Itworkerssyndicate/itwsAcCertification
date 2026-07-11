'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Trash2,
  Save,
  X,
  MapPin,
  Phone,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { addAcademy } from '@/lib/firebase/firestore';
import { logActivity } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EGYPTIAN_GOVERNORATES } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

// ============================================
// صفحة إضافة أكاديمية جديدة
// ============================================
export default function AddAcademyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
  const [branches, setBranches] = useState([
    {
      branchId: '1',
      governorate: '',
      address: '',
      phone: '',
      isMainBranch: true,
    },
  ]);

  // ============================================
  // إضافة فرع
  // ============================================
  const addBranch = () => {
    const newId = String(branches.length + 1);
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
      const academyData = {
        name: formData.name,
        taxNumber: formData.taxNumber,
        licenseNumber: formData.licenseNumber,
        branches: branches,
        createdBy: user?.uid || 'system',
        updatedBy: user?.uid || 'system',
        isDeleted: false,
      };

      const result = await addAcademy(academyData);

      if (result.success) {
        setSuccess(true);
        toast.success('تم إضافة الأكاديمية بنجاح');

        // تسجيل النشاط
        await logActivity({
          userId: user?.uid || 'system',
          userEmail: user?.email || 'system',
          userName: user?.displayName || 'النظام',
          userRole: user?.role || 'admin',
          type: 'create_academy',
          description: `إضافة أكاديمية جديدة: ${formData.name}`,
          details: {
            academyName: formData.name,
            licenseNumber: formData.licenseNumber,
            branchesCount: branches.length,
            createdBy: user?.email || 'system',
          },
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
        });

        // إعادة تعيين النموذج بعد 2 ثانية
        setTimeout(() => {
          router.push('/dashboard/admin/academies');
        }, 2000);
      } else {
        setError(result.error || 'فشل إضافة الأكاديمية');
        toast.error(result.error || 'فشل إضافة الأكاديمية');
      }
    } catch (err: any) {
      console.error('Add academy error:', err);
      setError(err.message || 'حدث خطأ أثناء إضافة الأكاديمية');
      toast.error(err.message || 'حدث خطأ أثناء إضافة الأكاديمية');
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
            <h1 className="text-2xl font-bold text-white">إضافة أكاديمية جديدة</h1>
            <p className="text-sm text-gray-400">إضافة أكاديمية جديدة إلى نظام النقابة</p>
          </div>
        </div>
      </div>

      {/* نموذج الإضافة */}
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
                      <span className="text-sm font-medium text-white">
                        فرع {index + 1}
                        {branch.isMainBranch && (
                          <span className="mr-2 text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                            الرئيسي
                          </span>
                        )}
                      </span>
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
                  <span className="text-sm">تم إضافة الأكاديمية بنجاح</span>
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
                حفظ الأكاديمية
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
