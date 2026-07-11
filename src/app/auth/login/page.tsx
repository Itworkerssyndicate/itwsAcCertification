'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle,
  Shield,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

// ============================================
// صفحة تسجيل الدخول
// ============================================
export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // ============================================
  // توجيه المستخدم إذا كان مسجل الدخول
  // ============================================
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard/admin');
    }
  }, [isAuthenticated, authLoading, router]);

  // ============================================
  // معالجة تسجيل الدخول
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // التحقق من البيانات
    if (!email.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    if (!password.trim()) {
      setError('الرجاء إدخال كلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('مرحباً بك في المنصة');
        router.push('/dashboard/admin');
      } else {
        setError(result.error || 'فشل تسجيل الدخول');
        toast.error(result.error || 'فشل تسجيل الدخول');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      toast.error(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // عرض حالة التحميل
  // ============================================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
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

      {/* محتوى تسجيل الدخول */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="glass p-8">
          {/* الشعار */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">نقابة تكنولوجيا المعلومات</h1>
            <p className="text-sm text-gray-400 mt-1">لجنة التحول الرقمي والتدريب</p>
            <p className="text-sm text-gray-400 mt-2">تسجيل الدخول إلى لوحة التحكم</p>
          </div>

          {/* نموذج تسجيل الدخول */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                placeholder="admin@itws.org.eg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                disabled={loading}
              />
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                كلمة المرور
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* خيارات إضافية */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                />
                تذكرني
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
              >
                نسيت كلمة المرور؟
              </Link>
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

            {/* زر تسجيل الدخول */}
            <Button
              type="submit"
              loading={loading}
              icon={LogIn}
              fullWidth
              size="lg"
            >
              تسجيل الدخول
            </Button>
          </form>

          {/* روابط إضافية */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              ليس لديك حساب؟{' '}
              <Link
                href="/auth/register"
                className="text-primary-500 hover:text-primary-400 transition-colors"
              >
                إنشاء حساب جديد
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
