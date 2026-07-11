'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ExternalLink,
  Users,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { searchAcademyByLicense, logSearch } from '@/lib/firebase/firestore';
import { Academy } from '@/types';
import toast from 'react-hot-toast';

// ============================================
// قائمة المحافظات المصرية
// ============================================
const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الإسكندرية',
  'الجيزة',
  'القليوبية',
  'الشرقية',
  'الدقهلية',
  'المنوفية',
  'الغربية',
  'كفر الشيخ',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'شمال سيناء',
  'جنوب سيناء',
  'البحر الأحمر',
  'الأقصر',
  'أسوان',
  'أسيوط',
  'سوهاج',
  'قنا',
  'المنيا',
  'بني سويف',
  'الفيوم',
  'مطروح',
  'الوادي الجديد',
  'حلوان',
  'العاشر من رمضان',
];

// ============================================
// أنواع الجهات
// ============================================
const ENTITY_TYPES = [
  'شركة',
  'مصنع',
  'جهة حكومية',
  'مؤسسة خاصة',
  'فرد',
  'أكاديمية',
  'جامعة',
  'مدرسة',
  'مركز تدريب',
  'أخرى',
];

// ============================================
// صفحة البحث عن الأكاديميات
// ============================================
export default function SearchPage() {
  const [searchValue, setSearchValue] = useState('');
  const [searcherName, setSearcherName] = useState('');
  const [searcherPhone, setSearcherPhone] = useState('');
  const [searcherEntity, setSearcherEntity] = useState('');
  const [searcherEntityType, setSearcherEntityType] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // ============================================
  // البحث عن الأكاديمية
  // ============================================
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من البيانات
    if (!searchValue.trim()) {
      toast.error('الرجاء إدخال الرقم الاعتمادي للأكاديمية');
      return;
    }
    if (!searcherName.trim()) {
      toast.error('الرجاء إدخال اسمك');
      return;
    }
    if (!searcherPhone.trim()) {
      toast.error('الرجاء إدخال رقم هاتفك');
      return;
    }
    if (!searcherEntity.trim()) {
      toast.error('الرجاء إدخال اسم الجهة');
      return;
    }
    if (!searcherEntityType) {
      toast.error('الرجاء اختيار نوع الجهة');
      return;
    }
    if (!governorate) {
      toast.error('الرجاء اختيار المحافظة');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const result = await searchAcademyByLicense(searchValue.trim());
      
      if (result) {
        setAcademy(result);
        toast.success('تم العثور على الأكاديمية');
        
        // تسجيل عملية البحث
        await logSearch({
          searchType: 'academy',
          searchValue: searchValue.trim(),
          searcherName,
          searcherPhone,
          searcherEntity,
          searcherEntityType,
          governorate,
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
          resultCount: 1,
        });
      } else {
        setAcademy(null);
        setError('لم يتم العثور على أكاديمية بهذا الرقم الاعتمادي');
        toast.error('لم يتم العثور على الأكاديمية');
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
  // عرض فروع الأكاديمية
  // ============================================
  const renderBranches = () => {
    if (!academy || !academy.branches || academy.branches.length === 0) {
      return (
        <div className="text-center text-gray-400 py-4">
          لا توجد فروع مسجلة لهذه الأكاديمية
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {academy.branches.map((branch) => (
          <Card key={branch.branchId} className="bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <Building2 size={18} className="text-primary-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{branch.governorate}</span>
                  {branch.isMainBranch && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                      الرئيسي
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{branch.address}</p>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <Phone size={14} className="text-gray-500" />
                  {branch.phone}
                </p>
              </div>
            </div>
          </Card>
        ))}
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
          <h1 className="text-2xl font-bold text-white">البحث عن أكاديمية</h1>
        </div>

        {/* نموذج البحث */}
        <Card className="glass p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">الرقم الاعتمادي للأكاديمية *</label>
                <Input
                  type="text"
                  placeholder="أدخل الرقم الاعتمادي"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">اسم الباحث *</label>
                <Input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={searcherName}
                  onChange={(e) => setSearcherName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">رقم الهاتف *</label>
                <Input
                  type="tel"
                  placeholder="أدخل رقم هاتفك"
                  value={searcherPhone}
                  onChange={(e) => setSearcherPhone(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">اسم الجهة *</label>
                <Input
                  type="text"
                  placeholder="أدخل اسم الجهة التي تمثلها"
                  value={searcherEntity}
                  onChange={(e) => setSearcherEntity(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">نوع الجهة *</label>
                <select
                  value={searcherEntityType}
                  onChange={(e) => setSearcherEntityType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                >
                  <option value="">اختر نوع الجهة</option>
                  {ENTITY_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">المحافظة *</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                >
                  <option value="">اختر المحافظة</option>
                  {EGYPTIAN_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" loading={loading} icon={Search} fullWidth>
              بحث عن الأكاديمية
            </Button>
            <p className="text-xs text-gray-500 text-center">
              * حقول إلزامية - سيتم تسجيل بيانات البحث لأغراض إحصائية
            </p>
          </form>
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
                <h3 className="text-xl font-bold text-white mb-2">لم يتم العثور على الأكاديمية</h3>
                <p className="text-gray-400">{error}</p>
                <p className="text-sm text-gray-500 mt-4">
                  تأكد من صحة الرقم الاعتمادي المدخل أو تواصل مع النقابة
                </p>
              </Card>
            ) : academy ? (
              <Card className="glass p-6">
                {/* رأس الأكاديمية */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3">
                      <Building2 size={24} className="text-primary-500" />
                      <h2 className="text-xl font-bold text-white">{academy.name}</h2>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-400">
                        الرقم الاعتمادي: {academy.licenseNumber}
                      </span>
                      <span className="text-sm text-gray-400">
                        البطاقة الضريبية: {academy.taxNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                      معتمدة
                    </span>
                  </div>
                </div>

                {/* الفروع */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-primary-500" />
                    <h3 className="text-lg font-bold text-white">الفروع</h3>
                    <span className="text-sm text-gray-400">
                      ({academy.branches?.length || 0} فرع)
                    </span>
                  </div>
                  {renderBranches()}
                </div>

                {/* معلومات إضافية */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>تم التسجيل: {new Date(academy.createdAt).toLocaleDateString('ar-EG')}</span>
                    <span>آخر تحديث: {new Date(academy.updatedAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </Card>
            ) : null}
          </motion.div>
        )}

        {/* روابط سريعة */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            تبحث عن شهادة؟{' '}
            <Link href="/public/verify" className="text-primary-500 hover:text-primary-400 transition-colors">
              تحقق من صحة الشهادة
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
