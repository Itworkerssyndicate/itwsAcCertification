'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Calendar,
  ChevronRight,
  Download,
  Printer,
  Eye,
  Plus,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useActivityLog } from '@/hooks/useActivityLog';
import {
  getAllAcademies,
  getAllCertificates,
  getSearchLogs,
} from '@/lib/firebase/firestore';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import toast from 'react-hot-toast';

// ============================================
// لوحة التحكم الرئيسية
// ============================================
export default function AdminDashboardPage() {
  const { user, isSuperAdmin } = useAuth();
  const { permissions } = usePermissions();
  const { activities, getRecentActivities, getActivityStats, loading: activitiesLoading } = useActivityLog();
  
  const [academies, setAcademies] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [searchLogs, setSearchLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAcademies: 0,
    totalCertificates: 0,
    totalUsers: 0,
    totalSearches: 0,
    certificatesThisMonth: 0,
    academiesThisMonth: 0,
  });

  // ============================================
  // تحميل البيانات
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [academiesData, certificatesData, searchLogsData] = await Promise.all([
          getAllAcademies(),
          getAllCertificates(),
          getSearchLogs(),
        ]);

        setAcademies(academiesData);
        setCertificates(certificatesData);
        setSearchLogs(searchLogsData);

        // حساب الإحصائيات
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const certificatesThisMonth = certificatesData.filter((cert: any) => {
          const date = cert.issuedAt instanceof Date ? cert.issuedAt : new Date(cert.issuedAt);
          return date >= monthStart;
        });

        const academiesThisMonth = academiesData.filter((academy: any) => {
          const date = academy.createdAt instanceof Date ? academy.createdAt : new Date(academy.createdAt);
          return date >= monthStart;
        });

        setStats({
          totalAcademies: academiesData.length,
          totalCertificates: certificatesData.length,
          totalUsers: 0, // سيتم جلبها من مكان آخر
          totalSearches: searchLogsData.length,
          certificatesThisMonth: certificatesThisMonth.length,
          academiesThisMonth: academiesThisMonth.length,
        });
      } catch (error) {
        console.error('Fetch dashboard data error:', error);
        toast.error('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    getRecentActivities(10);
  }, []);

  // ============================================
  // إحصائيات سريعة
  // ============================================
  const statCards = [
    {
      title: 'الأكاديميات',
      value: stats.totalAcademies,
      icon: Building2,
      change: { value: stats.academiesThisMonth, type: 'increase' as const },
      color: 'text-primary-500',
    },
    {
      title: 'الشهادات',
      value: stats.totalCertificates,
      icon: FileText,
      change: { value: stats.certificatesThisMonth, type: 'increase' as const },
      color: 'text-secondary-500',
    },
    {
      title: 'عمليات البحث',
      value: stats.totalSearches,
      icon: Activity,
      change: { value: 0, type: 'increase' as const },
      color: 'text-green-500',
    },
    {
      title: 'المستخدمين',
      value: stats.totalUsers,
      icon: Users,
      change: { value: 0, type: 'increase' as const },
      color: 'text-yellow-500',
    },
  ];

  // ============================================
  // أحدث الأنشطة
  // ============================================
  const recentActivities = activities.slice(0, 5);

  // ============================================
  // أعمدة الجدول للأنشطة
  // ============================================
  const activityColumns = [
    { key: 'userName', label: 'المستخدم' },
    { key: 'type', label: 'النوع' },
    { key: 'description', label: 'الوصف' },
    {
      key: 'timestamp',
      label: 'التاريخ',
      render: (item: any) => {
        const date = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp);
        return date.toLocaleString('ar-EG');
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
          <p className="text-sm text-gray-400">مرحباً بك {user?.displayName || 'أدمن'}</p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Link href="/dashboard/admin/settings">
              <Button variant="outline" size="sm" icon={Settings}>
                الإعدادات
              </Button>
            </Link>
          )}
          <Link href="/dashboard/admin/reports">
            <Button variant="outline" size="sm" icon={BarChart3}>
              التقارير
            </Button>
          </Link>
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={<stat.icon size={24} className={stat.color} />}
              change={stat.change}
            />
          </motion.div>
        ))}
      </div>

      {/* روابط سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/academies/add">
          <Card className="glass p-4 text-center hover:bg-white/5 transition-colors">
            <Plus size={24} className="text-primary-500 mx-auto mb-2" />
            <span className="text-sm text-white">إضافة أكاديمية</span>
          </Card>
        </Link>
        <Link href="/dashboard/admin/certificates/add">
          <Card className="glass p-4 text-center hover:bg-white/5 transition-colors">
            <Plus size={24} className="text-secondary-500 mx-auto mb-2" />
            <span className="text-sm text-white">إضافة شهادة</span>
          </Card>
        </Link>
        <Link href="/dashboard/admin/academies">
          <Card className="glass p-4 text-center hover:bg-white/5 transition-colors">
            <Eye size={24} className="text-green-500 mx-auto mb-2" />
            <span className="text-sm text-white">عرض الأكاديميات</span>
          </Card>
        </Link>
        <Link href="/dashboard/admin/certificates">
          <Card className="glass p-4 text-center hover:bg-white/5 transition-colors">
            <Eye size={24} className="text-yellow-500 mx-auto mb-2" />
            <span className="text-sm text-white">عرض الشهادات</span>
          </Card>
        </Link>
      </div>

      {/* أحدث النشاطات */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-primary-500" />
            <h3 className="text-lg font-bold text-white">أحدث النشاطات</h3>
          </div>
          <Link href="/dashboard/admin/activities">
            <Button variant="ghost" size="sm">
              عرض الكل
              <ChevronRight size={16} />
            </Button>
          </Link>
        </div>

        {activitiesLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            لا توجد نشاطات حديثة
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Activity size={14} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm text-white">{activity.description}</p>
                    <p className="text-xs text-gray-400">
                      {activity.userName} • {activity.timestamp instanceof Date 
                        ? activity.timestamp.toLocaleString('ar-EG')
                        : new Date(activity.timestamp).toLocaleString('ar-EG')}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400">
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* إحصائيات سريعة - شهادات حسب التقدير */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass p-6">
          <h3 className="text-lg font-bold text-white mb-4">الشهادات حسب التقدير</h3>
          <div className="space-y-2">
            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'].map((grade) => {
              const count = certificates.filter((c) => c.grade === grade).length;
              return (
                <div key={grade} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-10">{grade}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        grade.startsWith('A') ? 'bg-green-500' :
                        grade.startsWith('B') ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min((count / 100) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-left">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="glass p-6">
          <h3 className="text-lg font-bold text-white mb-4">أحدث الشهادات</h3>
          <div className="space-y-3">
            {certificates.slice(0, 5).map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm text-white font-medium">{cert.studentName}</p>
                  <p className="text-xs text-gray-400">{cert.courseName}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  {cert.grade}
                </span>
              </div>
            ))}
            {certificates.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                لا توجد شهادات مسجلة
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
