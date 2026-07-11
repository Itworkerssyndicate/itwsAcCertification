'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  FileCheck,
  Building2,
  Shield,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// ============================================
// الصفحة الرئيسية العامة
// ============================================
export default function PublicPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchType, setSearchType] = useState<'certificate' | 'academy'>('certificate');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================
  // معالجة البحث
  // ============================================
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    try {
      if (searchType === 'certificate') {
        router.push(`/public/verify/${searchValue.trim()}`);
      } else {
        router.push(`/public/academy/${searchValue.trim()}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // إحصائيات سريعة
  // ============================================
  const stats = [
    {
      icon: GraduationCap,
      label: 'شهادات موثقة',
      value: '15,247',
      change: '+12%',
      color: 'text-primary-500',
    },
    {
      icon: Building2,
      label: 'أكاديميات معتمدة',
      value: '87',
      change: '+5%',
      color: 'text-secondary-500',
    },
    {
      icon: Users,
      label: 'خريجين مسجلين',
      value: '12,891',
      change: '+8%',
      color: 'text-green-500',
    },
    {
      icon: TrendingUp,
      label: 'عمليات بحث',
      value: '45,632',
      change: '+23%',
      color: 'text-yellow-500',
    },
  ];

  // ============================================
  // مزايا المنصة
  // ============================================
  const features = [
    {
      icon: Shield,
      title: 'توثيق معتمد',
      description: 'شهادات موثقة من نقابة تكنولوجيا المعلومات والبرمجيات',
      color: 'text-primary-500',
    },
    {
      icon: Award,
      title: 'جودة عالية',
      description: 'معايير صارمة لاعتماد الأكاديميات والبرامج التدريبية',
      color: 'text-secondary-500',
    },
    {
      icon: Search,
      title: 'بحث سريع',
      description: 'تحقق من صحة الشهادات بسهولة باستخدام الكود الفريد',
      color: 'text-green-500',
    },
    {
      icon: FileCheck,
      title: 'تحقق فوري',
      description: 'نتائج دقيقة وفورية مع عرض جميع بيانات الشهادة',
      color: 'text-yellow-500',
    },
  ];

  // ============================================
  // خطوات الاستخدام
  // ============================================
  const steps = [
    {
      number: '١',
      title: 'أدخل كود الشهادة',
      description: 'أدخل الكود الفريد الموجود على الشهادة في حقل البحث',
      icon: Search,
    },
    {
      number: '٢',
      title: 'تحقق من البيانات',
      description: 'عرض جميع بيانات الشهادة بما فيها اسم الطالب والدورة والتقدير',
      icon: CheckCircle,
    },
    {
      number: '٣',
      title: 'اطبع أو حمّل',
      description: 'احصل على نسخة رسمية من الشهادة بصيغة PDF مع لوجو وختم النقابة',
      icon: FileCheck,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* خلفية ذكاء اصطناعي */}
      <div className="ai-background">
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        <div className="grid-lines"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10">
        {/* الهيدر */}
        <header className="glass border-b border-white/5">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ن.ت</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">نقابة تكنولوجيا المعلومات</h1>
                  <p className="text-xs text-gray-400">لجنة التحول الرقمي والتدريب</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <Link href="/dashboard/admin">
                    <Button variant="primary" size="sm">
                      لوحة التحكم
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      تسجيل الدخول
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* القسم الرئيسي */}
        <main className="container mx-auto px-4 py-12">
          {/* البطل */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-gradient">تحقق من صحة</span>
              <br />
              <span className="text-white">شهاداتك التدريبية</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              منصة موثوقة للتحقق من صحة الشهادات الصادرة عن الأكاديميات المعتمدة من نقابة تكنولوجيا المعلومات والبرمجيات
            </p>
          </motion.div>

          {/* شريط البحث */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <Card className="glass p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'certificate' | 'academy')}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all sm:w-40"
                  >
                    <option value="certificate">كود الشهادة</option>
                    <option value="academy">رقم الأكاديمية</option>
                  </select>
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder={searchType === 'certificate' ? 'أدخل كود الشهادة (مثال: NTI-CERT-2026-ABCDEF)' : 'أدخل الرقم الاعتمادي للأكاديمية'}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <Button type="submit" loading={loading} icon={Search}>
                    بحث
                  </Button>
                </div>
                <div className="text-center text-sm text-gray-500">
                  {searchType === 'certificate' ? 'أدخل الكود المطبوع على الشهادة' : 'أدخل الرقم الاعتمادي للأكاديمية'}
                </div>
              </form>
            </Card>
          </motion.div>

          {/* الإحصائيات */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="glass text-center p-6">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="text-xs text-green-500 mt-1">{stat.change}</div>
              </Card>
            ))}
          </motion.div>

          {/* المزايا */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-center text-white mb-8">مزايا المنصة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="glass text-center p-6">
                  <feature.icon className={`w-12 h-12 ${feature.color} mx-auto mb-3`} />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* خطوات الاستخدام */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-center text-white mb-8">كيفية استخدام المنصة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <Card key={index} className="glass p-6 text-center relative">
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center text-sm">
                    {step.number}
                  </div>
                  <step.icon className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* روابط سريعة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-gray-400 mb-4">
              هل تحتاج إلى مساعدة؟ تواصل مع لجنة التحول الرقمي والتدريب
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button variant="outline" icon={Mail}>
                  اتصل بنا
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" icon={Globe}>
                  عن النقابة
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>

        {/* التذييل */}
        <footer className="border-t border-white/5 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} نقابة تكنولوجيا المعلومات والبرمجيات - جميع الحقوق محفوظة</p>
              <p className="mt-1">لجنة التحول الرقمي والتدريب</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
