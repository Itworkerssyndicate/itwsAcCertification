'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Phone,
  Shield,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { registerUser } from '@/lib/firebase/auth';
import { logActivity } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

// ============================================
// صفحة التسجيل (للسوبر أدمن فقط)
// ============================================
export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, isSuperAdmin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
    role: 'admin' as 'admin' | 'super_admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ============================================
  // التحقق من الصلاحية
  // ============================================
  useEffect(() => {
    if (isAuthenticated && !isSuperAdmin) {
      router.push('/dashboard/admin');
    }
  }, [isAuthenticated, isSuperAdmin, router]);

  // ============================================
  // معالجة التسجيل
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // التحقق من البيانات
    if (!formData.email.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    if (!formData.password.trim()) {
      setError('الرجاء إدخال كلمة المرور');
      return;
    }
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    if (!formData.displayName.trim()) {
      setError('الرجاء إدخال الاسم');
      return;
    }
    if (!formData.phone.trim()) {
      setError('الرجاء إدخال رقم الهاتف');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(
        formData.email,
        formData.password,
        formData.displayName,
        formData.phone,
        formData.role,
        user?.uid || 'system'
      );

      if (result.success) {
        setSuccess(true);
        toast.success('تم إنشاء المستخدم بنجاح');
        
        // تسجيل النشاط
        await logActivity({
          userId: user?.uid || 'system',
          userEmail: user?.email || 'system',
          userName: user?.displayName || 'النظام',
          userRole: user?.role || 'super_admin',
          type: 'user_create',
          description: `إنشاء مستخدم جديد: ${formData.email}`,
          details: {
            newUser: {
              email: formData.email,
              role: formData.role,
              name: formData.displayName,
            },
            createdBy: user?.email || 'system',
          },
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
        });

        // إعادة تعيين النموذج
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          displayName: '',
          phone: '',
          role: 'admin',
        });
      } else {
        setError(result.error || 'فشل إنشاء المستخدم');
        toast.error(result.error || 'فشل إنشاء المستخدم');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'حدث خطأ أثناء إنشاء المستخدم');
      toast.error(err.message || 'حدث خطأ أثناء إنشاء المستخدم');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // تحديث بيانات النموذج
  // ============================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ============================================
  // التحقق من الصلاحية
  // ============================================
  if (isAuthenticated && !isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* خلفية ذكاء اصطناعي */}
      <div className="ai-background">
        <div className="particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        <div className="grid-lines"></div>
      </div>

      {/* محتوى التسجيل */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="glass p-8">
          {/* الشعار */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">إنشاء حساب جديد</h1>
            <p className="text-sm text-gray-400 mt-1">إضافة مستخدم جديد إلى النظام</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400">
              صلاحية السوبر أدمن فقط
            </div>
          </div>

          {/* نموذج التسجيل */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                البريد الإلكتروني *
              </label>
              <Input
                type="email"
                name="email"
                placeholder="admin@academy.com"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                disabled={loading}
                required
              />
            </div>

            {/* الاسم */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                الاسم الكامل *
              </label>
              <Input
                type="text"
                name="displayName"
                placeholder="أدخل الاسم الكامل"
                value={formData.displayName}
                onChange={handleChange}
                icon={User}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                disabled={loading}
                required
              />
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                رقم الهاتف *
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="01012345678"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                disabled={loading}
                required
              />
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                كلمة المرور *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  icon={Lock}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">يجب أن تكون 8 أحرف على الأقل</p>
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                تأكيد كلمة المرور *
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={Lock}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* الدور */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                الدور *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                disabled={loading}
              >
                <option value="admin">أدمن</option>
                <option value="super_admin">سوبر أدمن</option>
              </select>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* رسالة النجاح */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
              >
                <CheckCircle size={18} />
                <span>تم إنشاء المستخدم بنجاح</span>
              </motion.div>
            )}

            {/* زر التسجيل */}
            <Button
              type="submit"
              loading={loading}
              icon={UserPlus}
              fullWidth
              size="lg"
            >
              إنشاء حساب
            </Button>
          </form>

          {/* روابط إضافية */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              لديك حساب بالفعل؟{' '}
              <Link
                href="/auth/login"
                className="text-primary-500 hover:text-primary-400 transition-colors"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>

          {/* معلومات النظام */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Shield size={12} />
                آمن
              </span>
              <span className="w-px h-4 bg-gray-700"></span>
              <span>الإصدار 1.0.0</span>
            </div>
          </div>
        </Card>

        {/* العودة إلى الرئيسية */}
        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← العودة إلى الرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
