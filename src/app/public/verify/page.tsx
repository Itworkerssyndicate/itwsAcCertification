'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Award,
  Building2,
  Download,
  Printer,
  Share2,
  QrCode,
  Mail,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { searchCertificate, logSearch } from '@/lib/firebase/firestore';
import { Certificate } from '@/types';
import toast from 'react-hot-toast';

// ============================================
// صفحة التحقق من الشهادة
// ============================================
export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // ============================================
  // البحث عن الشهادة
  // ============================================
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('الرجاء إدخال كود الشهادة');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const result = await searchCertificate(code.trim());
      
      if (result) {
        setCertificate(result);
        toast.success('تم العثور على الشهادة');
        
        // تسجيل عملية البحث
        await logSearch({
          searchType: 'certificate',
          searchValue: code.trim(),
          searcherName: 'زائر',
          searcherPhone: 'غير متاح',
          searcherEntity: 'مستخدم عام',
          searcherEntityType: 'فرد',
          governorate: 'غير محدد',
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
          resultCount: 1,
        });
      } else {
        setCertificate(null);
        setError('لم يتم العثور على شهادة بهذا الكود');
        toast.error('لم يتم العثور على الشهادة');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('حدث خطأ أثناء البحث');
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // طباعة الشهادة
  // ============================================
  const handlePrint = () => {
    window.print();
  };

  // ============================================
  // تحميل الشهادة
  // ============================================
  const handleDownload = async () => {
    try {
      toast.success('جاري تحميل الشهادة...');
      // هنا سيتم تنفيذ تحميل PDF
    } catch (err) {
      toast.error('حدث خطأ أثناء تحميل الشهادة');
    }
  };

  // ============================================
  // مشاركة الشهادة
  // ============================================
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'شهادة معتمدة من نقابة تكنولوجيا المعلومات',
          text: `شهادة رقم: ${certificate?.certificateCode}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  // ============================================
  // عرض حالة الشهادة
  // ============================================
  const renderStatus = () => {
    if (!certificate) return null;

    return (
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle size={20} />
        <span className="font-medium">شهادة صالحة</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* خلفية ذكاء اصطناعي */}
      <div className="ai-background">
        <div className="particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        <div className="grid-lines"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* رأس الصفحة */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-white">التحقق من الشهادة</h1>
        </div>

        {/* نموذج البحث */}
        <Card className="glass p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="أدخل كود الشهادة (مثال: NTI-CERT-2026-ABCDEF)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              dir="ltr"
            />
            <Button type="submit" loading={loading} icon={FileText}>
              تحقق
            </Button>
          </form>
          <p className="text-sm text-gray-500 mt-3 text-center">
            أدخل الكود المطبوع على الشهادة للتحقق من صحتها
          </p>
        </Card>

        {/* نتائج البحث */}
        {searchPerformed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">جاري البحث...</p>
              </div>
            ) : error ? (
              <Card className="glass p-8 text-center">
                <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">لم يتم العثور على الشهادة</h3>
                <p className="text-gray-400">{error}</p>
                <p className="text-sm text-gray-500 mt-4">
                  تأكد من صحة الكود المدخل أو تواصل مع الأكاديمية المصدرة للشهادة
                </p>
              </Card>
            ) : certificate ? (
              <Card className="glass p-6">
                {/* رأس الشهادة */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-primary-500" />
                      <h2 className="text-xl font-bold text-white">تفاصيل الشهادة</h2>
                    </div>
                    {renderStatus()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint} icon={Printer}>
                      طباعة
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} icon={Download}>
                      تحميل
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} icon={Share2}>
                      مشاركة
                    </Button>
                  </div>
                </div>

                {/* بيانات الشهادة */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User size={18} className="text-primary-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-400">اسم الطالب</p>
                        <p className="text-white font-medium">{certificate.studentName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Award size={18} className="text-primary-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-400">اسم الدورة</p>
                        <p className="text-white font-medium">{certificate.courseName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar size={18} className="text-primary-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-400">تاريخ الاجتياز</p>
                        <p className="text-white font-medium">
                          {certificate.completionDate instanceof Date 
                            ? certificate.completionDate.toLocaleDateString('ar-EG')
                            : new Date(certificate.completionDate).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 size={18} className="text-primary-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-400">الأكاديمية</p>
                        <p className="text-white font-medium">{certificate.academyName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Award size={18} className="text-primary-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-400">رقم الاعتماد</p>
                        <p className="text-white font-medium">{certificate.academyLicenseNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText size={18} className="text-primary-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-400">كود الشهادة</p>
                        <p className="text-white font-medium font-mono">{certificate.certificateCode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* التقدير */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">التقدير</span>
                    <span className={`text-2xl font-bold ${
                      certificate.grade.startsWith('A') ? 'text-green-500' :
                      certificate.grade.startsWith('B') ? 'text-blue-500' :
                      certificate.grade.startsWith('C') ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {certificate.grade}
                    </span>
                  </div>
                </div>

                {/* ختم التحقق */}
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <span className="text-sm text-gray-400">
                      تم التحقق من صحة هذه الشهادة في {new Date().toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-500">رمز التحقق</span>
                  </div>
                </div>
              </Card>
            ) : null}
          </motion.div>
        )}

        {/* روابط سريعة */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            تواجه مشكلة في التحقق؟{' '}
            <Link href="/contact" className="text-primary-500 hover:text-primary-400 transition-colors">
              تواصل مع الدعم الفني
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
