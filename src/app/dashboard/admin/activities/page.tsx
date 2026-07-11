'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  FileText,
  Building2,
  Shield,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Printer,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

// ============================================
// صفحة سجل النشاطات
// ============================================
export default function ActivitiesPage() {
  const { user } = useAuth();
  const {
    activities,
    loading,
    fetchActivities,
    filterByType,
    filterByUser,
    filterByDate,
    getRecentActivities,
    getActivityStats,
  } = useActivityLog();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // ============================================
  // تحميل البيانات
  // ============================================
  useEffect(() => {
    fetchActivities();
  }, []);

  // ============================================
  // حساب الإحصائيات
  // ============================================
  useEffect(() => {
    if (activities.length > 0) {
      const statsData = getActivityStats();
      setStats(statsData);
    }
  }, [activities]);

  // ============================================
  // تصفية النشاطات
  // ============================================
  const filteredActivities = activities.filter((activity) => {
    // بحث
    const matchesSearch = 
      activity.description.includes(searchTerm) ||
      activity.userName.includes(searchTerm) ||
      activity.userEmail.includes(searchTerm) ||
      activity.type.includes(searchTerm);
    
    // فلتر النوع
    const matchesType = filterType === 'all' || activity.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // ============================================
  // أنواع النشاطات
  // ============================================
  const activityTypes = [
    { value: 'all', label: 'الكل' },
    { value: 'login', label: 'تسجيل دخول' },
    { value: 'logout', label: 'تسجيل خروج' },
    { value: 'create_academy', label: 'إضافة أكاديمية' },
    { value: 'update_academy', label: 'تعديل أكاديمية' },
    { value: 'delete_academy', label: 'حذف أكاديمية' },
    { value: 'create_certificate', label: 'إضافة شهادة' },
    { value: 'update_certificate', label: 'تعديل شهادة' },
    { value: 'delete_certificate', label: 'حذف شهادة' },
    { value: 'search_certificate', label: 'بحث عن شهادة' },
    { value: 'search_academy', label: 'بحث عن أكاديمية' },
    { value: 'generate_report', label: 'توليد تقرير' },
    { value: 'export_pdf', label: 'تصدير PDF' },
    { value: 'export_excel', label: 'تصدير Excel' },
    { value: 'user_create', label: 'إنشاء مستخدم' },
    { value: 'user_update', label: 'تعديل مستخدم' },
    { value: 'user_delete', label: 'حذف مستخدم' },
  ];

  // ============================================
  // الحصول على أيقونة النشاط
  // ============================================
  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      login: LogIn,
      logout: LogOut,
      create_academy: Plus,
      update_academy: Edit,
      delete_academy: Trash2,
      create_certificate: Plus,
      update_certificate: Edit,
      delete_certificate: Trash2,
      search_certificate: Search,
      search_academy: Search,
      generate_report: FileText,
      export_pdf: Printer,
      export_excel: FileText,
      user_create: User,
      user_update: Edit,
      user_delete: Trash2,
    };
    return icons[type] || Activity;
  };

  // ============================================
  // الحصول على لون النشاط
  // ============================================
  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      login: 'text-green-500',
      logout: 'text-red-500',
      create_academy: 'text-blue-500',
      update_academy: 'text-yellow-500',
      delete_academy: 'text-red-500',
      create_certificate: 'text-blue-500',
      update_certificate: 'text-yellow-500',
      delete_certificate: 'text-red-500',
      search_certificate: 'text-purple-500',
      search_academy: 'text-purple-500',
      generate_report: 'text-indigo-500',
      export_pdf: 'text-orange-500',
      export_excel: 'text-green-500',
      user_create: 'text-blue-500',
      user_update: 'text-yellow-500',
      user_delete: 'text-red-500',
    };
    return colors[type] || 'text-gray-500';
  };

  // ============================================
  // أعمدة الجدول
  // ============================================
  const columns = [
    {
      key: 'user',
      label: 'المستخدم',
      render: (item: any) => (
        <div>
          <p className="text-sm text-white">{item.userName}</p>
          <p className="text-xs text-gray-400">{item.userEmail}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'النوع',
      render: (item: any) => {
        const Icon = getActivityIcon(item.type);
        const color = getActivityColor(item.type);
        return (
          <div className="flex items-center gap-2">
            <Icon size={16} className={color} />
            <span className="text-sm text-gray-300">
              {activityTypes.find(t => t.value === item.type)?.label || item.type}
            </span>
          </div>
        );
      },
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (item: any) => (
        <span className="text-sm text-gray-300">{item.description}</span>
      ),
    },
    {
      key: 'timestamp',
      label: 'التاريخ والوقت',
      render: (item: any) => {
        const date = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp);
        return (
          <div className="text-sm text-gray-300">
            <div>{date.toLocaleDateString('ar-EG')}</div>
            <div className="text-xs text-gray-500">{date.toLocaleTimeString('ar-EG')}</div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (item: any) => (
        <button
          onClick={() => {
            setSelectedActivity(item);
            setShowViewModal(true);
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">سجل النشاطات</h1>
          <p className="text-sm text-gray-400">تتبع جميع النشاطات على المنصة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={RefreshCw} onClick={fetchActivities}>
            تحديث
          </Button>
          <Button variant="outline" icon={Download}>
            تصدير
          </Button>
        </div>
      </div>

      {/* الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="glass p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-400">إجمالي النشاطات</p>
          </Card>
          <Card className="glass p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.today}</p>
            <p className="text-xs text-gray-400">اليوم</p>
          </Card>
          <Card className="glass p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.thisWeek}</p>
            <p className="text-xs text-gray-400">هذا الأسبوع</p>
          </Card>
          <Card className="glass p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.thisMonth}</p>
            <p className="text-xs text-gray-400">هذا الشهر</p>
          </Card>
          <Card className="glass p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{Object.keys(stats.byUser).length}</p>
            <p className="text-xs text-gray-400">مستخدمين نشطين</p>
          </Card>
        </div>
      )}

      {/* شريط البحث والفلتر */}
      <Card className="glass p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="بحث في النشاطات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* الجدول */}
      <Card className="glass p-6">
        <Table
          data={filteredActivities}
          columns={columns}
          loading={loading}
          emptyMessage="لا توجد نشاطات مسجلة"
          searchable={false}
        />
      </Card>

      {/* مودال عرض التفاصيل */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedActivity(null);
        }}
        title="تفاصيل النشاط"
        size="lg"
      >
        {selectedActivity && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">المستخدم</p>
                <p className="text-white font-medium">{selectedActivity.userName}</p>
                <p className="text-sm text-gray-400">{selectedActivity.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">الدور</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedActivity.userRole === 'super_admin'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-primary-500/20 text-primary-400'
                }`}>
                  {selectedActivity.userRole === 'super_admin' ? 'سوبر أدمن' : 'أدمن'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400">نوع النشاط</p>
                <p className="text-white font-medium">
                  {activityTypes.find(t => t.value === selectedActivity.type)?.label || selectedActivity.type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">التاريخ والوقت</p>
                <p className="text-white font-medium">
                  {selectedActivity.timestamp instanceof Date 
                    ? selectedActivity.timestamp.toLocaleString('ar-EG')
                    : new Date(selectedActivity.timestamp).toLocaleString('ar-EG')}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-gray-400">الوصف</p>
              <p className="text-white">{selectedActivity.description}</p>
            </div>

            {selectedActivity.details && Object.keys(selectedActivity.details).length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-gray-400 mb-2">تفاصيل إضافية</p>
                <div className="bg-white/5 rounded-xl p-3">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedActivity.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {selectedActivity.ipAddress && (
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-gray-400">معلومات الجهاز</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">IP:</span>
                    <span className="text-white mr-2">{selectedActivity.ipAddress}</span>
                  </div>
                  {selectedActivity.userAgent && (
                    <div>
                      <span className="text-gray-500">المتصفح:</span>
                      <span className="text-white mr-2 text-xs">{selectedActivity.userAgent}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
