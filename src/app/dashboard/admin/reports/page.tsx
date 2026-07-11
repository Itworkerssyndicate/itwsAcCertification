'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  Printer,
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Building2,
  Users,
  Award,
  TrendingUp,
  PieChart,
  LineChart,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getAllAcademies, getAllCertificates, getSearchLogs } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

// ============================================
// صفحة التقارير
// ============================================
export default function ReportsPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [academies, setAcademies] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [searchLogs, setSearchLogs] = useState<any[]>([]);
  const [reportType, setReportType] = useState('certificates');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // ============================================
  // تحميل البيانات
  // ============================================
  useEffect(() => {
    fetchData();
  }, []);

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
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // أنواع التقارير
  // ============================================
  const reportTypes = [
    {
      id: 'certificates',
      label: 'تقرير الشهادات',
      icon: FileText,
      description: 'تقرير مفصل عن جميع الشهادات الصادرة',
    },
    {
      id: 'academies',
      label: 'تقرير الأكاديميات',
      icon: Building2,
      description: 'تقرير عن الأكاديميات المعتمدة وفروعها',
    },
    {
      id: 'searches',
      label: 'تقرير عمليات البحث',
      icon: Search,
      description: 'تقرير عن عمليات البحث على المنصة',
    },
    {
      id: 'statistics',
      label: 'تقرير إحصائي',
      icon: BarChart3,
      description: 'إحصائيات عامة عن المنصة',
    },
  ];

  // ============================================
  // توليد التقرير
  // ============================================
  const generateReport = async (format: 'pdf' | 'excel') => {
    setLoading(true);
    try {
      let data: any = {};
      let title = '';

      switch (reportType) {
        case 'certificates':
          title = 'تقرير الشهادات الصادرة';
          data = {
            title,
            generatedAt: new Date(),
            generatedBy: user?.displayName || 'النظام',
            committeeName: 'لجنة التحول الرقمي والتدريب',
            unionName: 'نقابة تكنولوجيا المعلومات والبرمجيات',
            data: certificates,
            summary: {
              total: certificates.length,
              byGrade: certificates.reduce((acc: any, cert: any) => {
                acc[cert.grade] = (acc[cert.grade] || 0) + 1;
                return acc;
              }, {}),
              byAcademy: certificates.reduce((acc: any, cert: any) => {
                acc[cert.academyName] = (acc[cert.academyName] || 0) + 1;
                return acc;
              }, {}),
            },
          };
          break;

        case 'academies':
          title = 'تقرير الأكاديميات المعتمدة';
          data = {
            title,
            generatedAt: new Date(),
            generatedBy: user?.displayName || 'النظام',
            committeeName: 'لجنة التحول الرقمي والتدريب',
            unionName: 'نقابة تكنولوجيا المعلومات والبرمجيات',
            data: academies,
            summary: {
              total: academies.length,
              totalBranches: academies.reduce((acc, a) => acc + (a.branches?.length || 0), 0),
              byGovernorate: academies.reduce((acc: any, a: any) => {
                a.branches?.forEach((b: any) => {
                  acc[b.governorate] = (acc[b.governorate] || 0) + 1;
                });
                return acc;
              }, {}),
            },
          };
          break;

        case 'searches':
          title = 'تقرير عمليات البحث';
          data = {
            title,
            generatedAt: new Date(),
            generatedBy: user?.displayName || 'النظام',
            committeeName: 'لجنة التحول الرقمي والتدريب',
            unionName: 'نقابة تكنولوجيا المعلومات والبرمجيات',
            data: searchLogs,
            summary: {
              total: searchLogs.length,
              byType: searchLogs.reduce((acc: any, log: any) => {
                acc[log.searchType] = (acc[log.searchType] || 0) + 1;
                return acc;
              }, {}),
              byGovernorate: searchLogs.reduce((acc: any, log: any) => {
                acc[log.governorate] = (acc[log.governorate] || 0) + 1;
                return acc;
              }, {}),
            },
          };
          break;

        case 'statistics':
          title = 'تقرير إحصائي شامل';
          data = {
            title,
            generatedAt: new Date(),
            generatedBy: user?.displayName || 'النظام',
            committeeName: 'لجنة التحول الرقمي والتدريب',
            unionName: 'نقابة تكنولوجيا المعلومات والبرمجيات',
            data: {
              certificates: {
                total: certificates.length,
                active: certificates.filter(c => c.isActive).length,
                byGrade: certificates.reduce((acc: any, cert: any) => {
                  acc[cert.grade] = (acc[cert.grade] || 0) + 1;
                  return acc;
                }, {}),
              },
              academies: {
                total: academies.length,
                totalBranches: academies.reduce((acc, a) => acc + (a.branches?.length || 0), 0),
              },
              searches: {
                total: searchLogs.length,
                byType: searchLogs.reduce((acc: any, log: any) => {
                  acc[log.searchType] = (acc[log.searchType] || 0) + 1;
                  return acc;
                }, {}),
              },
            },
            summary: {
              totalCertificates: certificates.length,
              totalAcademies: academies.length,
              totalSearches: searchLogs.length,
              totalBranches: academies.reduce((acc, a) => acc + (a.branches?.length || 0), 0),
            },
          };
          break;

        default:
          toast.error('نوع التقرير غير مدعوم');
          return;
      }

      setPreviewData(data);
      setShowPreview(true);

      toast.success(`تم توليد ${format === 'pdf' ? 'PDF' : 'Excel'} التقرير بنجاح`);
    } catch (error) {
      console.error('Generate report error:', error);
      toast.error('حدث خطأ أثناء توليد التقرير');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // تصدير التقرير
  // ============================================
  const handleExport = (format: 'pdf' | 'excel') => {
    // سيتم تنفيذ تصدير PDF أو Excel
    toast.success(`جاري تحميل التقرير بصيغة ${format === 'pdf' ? 'PDF' : 'Excel'}...`);
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">التقارير</h1>
          <p className="text-sm text-gray-400">توليد وتصدير تقارير المنصة</p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={fetchData}>
          تحديث البيانات
        </Button>
      </div>

      {/* أنواع التقارير */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer ${
              reportType === type.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setReportType(type.id)}
          >
            <Card className={`glass p-4 text-center transition-all ${
              reportType === type.id ? 'bg-primary-500/10' : ''
            }`}>
              <type.icon size={32} className="text-primary-500 mx-auto mb-2" />
              <h3 className="text-white font-bold">{type.label}</h3>
              <p className="text-xs text-gray-400 mt-1">{type.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* خيارات التقرير */}
      <Card className="glass p-6">
        <h3 className="text-lg font-bold text-white mb-4">خيارات التقرير</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">من تاريخ</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">إلى تاريخ</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
      </Card>

      {/* أزرار التصدير */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => generateReport('pdf')}
          loading={loading}
          icon={FileText}
          size="lg"
        >
          توليد PDF
        </Button>
        <Button
          onClick={() => generateReport('excel')}
          loading={loading}
          icon={FileSpreadsheet}
          size="lg"
          variant="secondary"
        >
          توليد Excel
        </Button>
        <Button
          variant="outline"
          icon={Printer}
          size="lg"
          onClick={() => window.print()}
        >
          طباعة
        </Button>
      </div>

      {/* معاينة التقرير */}
      {previewData && (
        <Modal
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewData(null);
          }}
          title="معاينة التقرير"
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{previewData.title}</h3>
                <p className="text-sm text-gray-400">
                  تم الإنشاء بواسطة: {previewData.generatedBy} •{' '}
                  {previewData.generatedAt instanceof Date 
                    ? previewData.generatedAt.toLocaleString('ar-EG')
                    : new Date(previewData.generatedAt).toLocaleString('ar-EG')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileText}
                  onClick={() => handleExport('pdf')}
                >
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileSpreadsheet}
                  onClick={() => handleExport('excel')}
                >
                  Excel
                </Button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              {/* عرض البيانات حسب نوع التقرير */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(previewData.summary || {}).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-400">{key}</p>
                      <p className="text-xl font-bold text-white">{String(value)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-gray-400 mb-2">عدد السجلات: {previewData.data?.length || 0}</p>
                  <div className="max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(previewData.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ملخص سريع */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass p-4">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-primary-500" />
            <div>
              <p className="text-sm text-gray-400">إجمالي الشهادات</p>
              <p className="text-2xl font-bold text-white">{certificates.length}</p>
            </div>
          </div>
        </Card>
        <Card className="glass p-4">
          <div className="flex items-center gap-3">
            <Building2 size={24} className="text-secondary-500" />
            <div>
              <p className="text-sm text-gray-400">إجمالي الأكاديميات</p>
              <p className="text-2xl font-bold text-white">{academies.length}</p>
            </div>
          </div>
        </Card>
        <Card className="glass p-4">
          <div className="flex items-center gap-3">
            <Search size={24} className="text-green-500" />
            <div>
              <p className="text-sm text-gray-400">إجمالي عمليات البحث</p>
              <p className="text-2xl font-bold text-white">{searchLogs.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
