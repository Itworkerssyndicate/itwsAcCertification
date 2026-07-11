'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Settings,
  Shield,
  Users,
  Image,
  Bell,
  Lock,
  Database,
  Cloud,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Globe,
  Clock,
  Mail,
  Phone,
  MapPin,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

// ============================================
// صفحة إعدادات النظام
// ============================================
export default function SettingsPage() {
  const { user, isSuperAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // بيانات الإعدادات
  // ============================================
  const [settings, setSettings] = useState({
    unionName: 'نقابة تكنولوجيا المعلومات والبرمجيات',
    committeeName: 'لجنة التحول الرقمي والتدريب',
    email: 'info@itws.org.eg',
    phone: '+20 2 12345678',
    address: 'القاهرة - مصر الجديدة - شارع النقابات',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    maintenanceMode: false,
  });

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
  // معالجة حفظ الإعدادات
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    setLoading(true);
    try {
      // محاكاة حفظ الإعدادات
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess(true);
      toast.success('تم حفظ الإعدادات بنجاح');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save settings error:', err);
      setError(err.message || 'حدث خطأ أثناء حفظ الإعدادات');
      toast.error(err.message || 'حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // تحديث بيانات النموذج
  // ============================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ============================================
  // عناصر الإعدادات
  // ============================================
  const settingsSections = [
    {
      title: 'معلومات النقابة',
      icon: Building2,
      fields: [
        { label: 'اسم النقابة', name: 'unionName', type: 'text' },
        { label: 'اسم اللجنة', name: 'committeeName', type: 'text' },
        { label: 'البريد الإلكتروني', name: 'email', type: 'email' },
        { label: 'رقم الهاتف', name: 'phone', type: 'tel' },
        { label: 'العنوان', name: 'address', type: 'text' },
      ],
    },
    {
      title: 'إعدادات الأمان',
      icon: Shield,
      fields: [
        { label: 'مدة الجلسة (دقائق)', name: 'sessionTimeout', type: 'number' },
        { label: 'عدد محاولات الدخول المسموحة', name: 'maxLoginAttempts', type: 'number' },
      ],
    },
    {
      title: 'إعدادات النظام',
      icon: Database,
      fields: [
        { label: 'وضع الصيانة', name: 'maintenanceMode', type: 'checkbox' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">إعدادات النظام</h1>
          <p className="text-sm text-gray-400">إدارة إعدادات المنصة والنقابة</p>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/settings/logo">
          <Card className="glass p-4 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <Image size={24} className="text-primary-500 mx-auto mb-2" />
            <span className="text-sm text-white">رفع اللوجو والختم</span>
          </Card>
        </Link>
        <Link href="/dashboard/admin/settings/users">
          <Card className="glass p-4 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <Users size={24} className="text-secondary-500 mx-auto mb-2" />
            <span className="text-sm text-white">إدارة المستخدمين</span>
          </Card>
        </Link>
        <Card className="glass p-4 text-center hover:bg-white/5 transition-colors cursor-pointer">
          <Bell size={24} className="text-yellow-500 mx-auto mb-2" />
          <span className="text-sm text-white">الإشعارات</span>
        </Card>
        <Card className="glass p-4 text-center hover:bg-white/5 transition-colors cursor-pointer">
          <Cloud size={24} className="text-green-500 mx-auto mb-2" />
          <span className="text-sm text-white">النسخ الاحتياطي</span>
        </Card>
      </div>

      {/* نموذج الإعدادات */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {settingsSections.map((section, index) => (
              <Card key={index} className="glass p-6">
                <div className="flex items-center gap-3 mb-4">
                  <section.icon size={20} className="text-primary-500" />
                  <h3 className="text-lg font-bold text-white">{section.title}</h3>
                </div>
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name={field.name}
                            checked={settings[field.name as keyof typeof settings] as boolean}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          <span className="text-sm text-gray-300">تفعيل</span>
                        </label>
                      ) : (
                        <Input
                          type={field.type}
                          name={field.name}
                          value={settings[field.name as keyof typeof settings] as string}
                          onChange={handleChange}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                          disabled={loading}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            <Card className="glass p-6">
              <h3 className="text-lg font-bold text-white mb-4">إجراءات سريعة</h3>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  icon={RefreshCw}
                  fullWidth
                  onClick={() => {
                    toast.success('جاري تحديث البيانات...');
                  }}
                >
                  تحديث البيانات
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  icon={Database}
                  fullWidth
                  onClick={() => {
                    toast.success('جاري إنشاء نسخة احتياطية...');
                  }}
                >
                  نسخ احتياطي
                </Button>
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
                  <span className="text-sm">تم حفظ الإعدادات بنجاح</span>
                </div>
              </motion.div>
            )}

            {/* أزرار الإجراء */}
            <Button
              type="submit"
              loading={loading}
              icon={Save}
              fullWidth
              size="lg"
            >
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </form>

      {/* معلومات النظام */}
      <Card className="glass p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">إصدار النظام</span>
            <p className="text-white font-medium">v1.0.0</p>
          </div>
          <div>
            <span className="text-gray-400">آخر تحديث</span>
            <p className="text-white font-medium">{new Date().toLocaleDateString('ar-EG')}</p>
          </div>
          <div>
            <span className="text-gray-400">المستخدم الحالي</span>
            <p className="text-white font-medium">{user?.displayName || 'غير معروف'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
