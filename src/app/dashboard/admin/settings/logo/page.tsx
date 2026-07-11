'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Image,
  Upload,
  Save,
  X,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  FileImage,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { uploadUnionLogo, uploadUnionStamp } from '@/lib/cloudinary/upload';
import { logActivity } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

// ============================================
// صفحة رفع اللوجو والختم
// ============================================
export default function LogoPage() {
  const { user, isSuperAdmin } = useAuth();
  const { hasPermission } = usePermissions();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // حالة الملفات
  // ============================================
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

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
  // اختيار ملف اللوجو
  // ============================================
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        toast.error('الرجاء اختيار ملف صورة');
        return;
      }
      // التحقق من الحجم (حد أقصى 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 2MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // ============================================
  // اختيار ملف الختم
  // ============================================
  const handleStampSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        toast.error('الرجاء اختيار ملف صورة');
        return;
      }
      // التحقق من الحجم (حد أقصى 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 2MB');
        return;
      }
      setStampFile(file);
      setStampPreview(URL.createObjectURL(file));
    }
  };

  // ============================================
  // إزالة اللوجو
  // ============================================
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  // ============================================
  // إزالة الختم
  // ============================================
  const removeStamp = () => {
    setStampFile(null);
    setStampPreview(null);
    if (stampInputRef.current) {
      stampInputRef.current.value = '';
    }
  };

  // ============================================
  // رفع اللوجو والختم
  // ============================================
  const handleUpload = async () => {
    setError(null);
    setSuccess(false);

    if (!logoFile && !stampFile) {
      setError('الرجاء اختيار ملف على الأقل');
      toast.error('الرجاء اختيار ملف على الأقل');
      return;
    }

    setUploading(true);
    try {
      // رفع اللوجو
      if (logoFile) {
        const logoBuffer = await logoFile.arrayBuffer();
        await uploadUnionLogo(Buffer.from(logoBuffer));
        toast.success('تم رفع اللوجو بنجاح');
      }

      // رفع الختم
      if (stampFile) {
        const stampBuffer = await stampFile.arrayBuffer();
        await uploadUnionStamp(Buffer.from(stampBuffer));
        toast.success('تم رفع الختم بنجاح');
      }

      // تسجيل النشاط
      await logActivity({
        userId: user?.uid || 'system',
        userEmail: user?.email || 'system',
        userName: user?.displayName || 'النظام',
        userRole: user?.role || 'super_admin',
        type: 'upload_logo',
        description: 'رفع لوجو وختم النقابة',
        details: {
          logoUploaded: !!logoFile,
          stampUploaded: !!stampFile,
          uploadedBy: user?.email || 'system',
        },
        ipAddress: 'auto',
        userAgent: navigator.userAgent,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);

      // إعادة تعيين الملفات بعد الرفع
      if (logoFile) {
        removeLogo();
      }
      if (stampFile) {
        removeStamp();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'حدث خطأ أثناء رفع الملفات');
      toast.error(err.message || 'حدث خطأ أثناء رفع الملفات');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/settings"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">رفع اللوجو والختم</h1>
            <p className="text-sm text-gray-400">رفع لوجو وختم النقابة لاستخدامها في الشهادات</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* رفع اللوجو */}
        <Card className="glass p-6">
          <div className="flex items-center gap-3 mb-4">
            <Image size={20} className="text-primary-500" />
            <h3 className="text-lg font-bold text-white">لوجو النقابة</h3>
          </div>

          <div className="space-y-4">
            {/* معاينة اللوجو */}
            {logoPreview ? (
              <div className="relative">
                <div className="aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-white/10">
                  <img
                    src={logoPreview}
                    alt="لوجو النقابة"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={removeLogo}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="aspect-square max-w-[200px] mx-auto rounded-xl border-2 border-dashed border-white/20 hover:border-primary-500 transition-colors cursor-pointer flex flex-col items-center justify-center p-4"
              >
                <Upload size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-400 text-center">انقر لاختيار صورة اللوجو</p>
                <p className="text-xs text-gray-500">PNG, JPG, SVG • حد أقصى 2MB</p>
              </div>
            )}

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              fullWidth
              disabled={uploading}
            >
              <FileImage size={16} className="ml-2" />
              اختيار صورة
            </Button>
          </div>
        </Card>

        {/* رفع الختم */}
        <Card className="glass p-6">
          <div className="flex items-center gap-3 mb-4">
            <Image size={20} className="text-secondary-500" />
            <h3 className="text-lg font-bold text-white">ختم النقابة</h3>
          </div>

          <div className="space-y-4">
            {/* معاينة الختم */}
            {stampPreview ? (
              <div className="relative">
                <div className="aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-white/10">
                  <img
                    src={stampPreview}
                    alt="ختم النقابة"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={removeStamp}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => stampInputRef.current?.click()}
                className="aspect-square max-w-[200px] mx-auto rounded-xl border-2 border-dashed border-white/20 hover:border-primary-500 transition-colors cursor-pointer flex flex-col items-center justify-center p-4"
              >
                <Upload size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-400 text-center">انقر لاختيار صورة الختم</p>
                <p className="text-xs text-gray-500">PNG, JPG, SVG • حد أقصى 2MB</p>
              </div>
            )}

            <input
              ref={stampInputRef}
              type="file"
              accept="image/*"
              onChange={handleStampSelect}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => stampInputRef.current?.click()}
              fullWidth
              disabled={uploading}
            >
              <FileImage size={16} className="ml-2" />
              اختيار صورة
            </Button>
          </div>
        </Card>
      </div>

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
            <span className="text-sm">تم رفع الملفات بنجاح</span>
          </div>
        </motion.div>
      )}

      {/* أزرار الإجراء */}
      <div className="flex gap-4">
        <Button
          onClick={handleUpload}
          loading={uploading}
          icon={Save}
          size="lg"
        >
          {uploading ? 'جاري الرفع...' : 'رفع الملفات'}
        </Button>
        <Link href="/dashboard/admin/settings">
          <Button variant="outline" size="lg">
            إلغاء
          </Button>
        </Link>
      </div>
    </div>
  );
}
