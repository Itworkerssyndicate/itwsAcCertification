import * as XLSX from 'xlsx';
import { formatEgyptDate } from '../firebase/config';
import { getUnionLogoUrl, getUnionStampUrl } from '../cloudinary/upload';

// ============================================
// واجهات الدوال
// ============================================
interface ExcelColumn {
  key: string;
  label: string;
  width?: number;
}

interface ExcelOptions {
  title?: string;
  generatedBy?: string;
  committeeName?: string;
  unionName?: string;
  includeLogo?: boolean;
}

// ============================================
// توليد ملف Excel من البيانات
// ============================================
export const generateExcel = (
  data: any[],
  columns: ExcelColumn[],
  options: ExcelOptions = {}
): Buffer => {
  try {
    const {
      title = 'تقرير',
      generatedBy = 'نظام النقابة',
      committeeName = 'لجنة التحول الرقمي والتدريب',
      unionName = 'نقابة تكنولوجيا المعلومات والبرمجيات',
      includeLogo = true,
    } = options;

    // تنسيق التاريخ
    const now = formatEgyptDate(new Date());

    // إنشاء مصفوفة البيانات
    const excelData: any[] = [];

    // إضافة عنوان التقرير
    excelData.push([`${unionName}`]);
    excelData.push([`${committeeName}`]);
    excelData.push([]);
    excelData.push([`${title}`]);
    excelData.push([`تاريخ التقرير: ${now}`]);
    excelData.push([`تم إنشاؤه بواسطة: ${generatedBy}`]);
    excelData.push([]);

    // إضافة رأس الجدول
    const headers = columns.map(col => col.label);
    excelData.push(headers);

    // إضافة البيانات
    data.forEach((item) => {
      const row = columns.map(col => {
        const value = item[col.key];
        if (value instanceof Date) {
          return formatEgyptDate(value);
        }
        if (typeof value === 'boolean') {
          return value ? 'نعم' : 'لا';
        }
        if (value === null || value === undefined) {
          return '-';
        }
        return String(value);
      });
      excelData.push(row);
    });

    // إضافة تذييل
    excelData.push([]);
    excelData.push([`© ${new Date().getFullYear()} ${unionName} - جميع الحقوق محفوظة`]);

    // إنشاء كتاب Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // ضبط عرض الأعمدة
    if (columns.length > 0) {
      const colWidths = columns.map((col, index) => {
        // حساب العرض بناءً على طول البيانات
        let maxLength = col.label.length;
        data.forEach((item) => {
          const value = String(item[col.key] || '');
          if (value.length > maxLength) {
            maxLength = Math.min(value.length, 30);
          }
        });
        return { wch: Math.max(maxLength + 5, 15) };
      });
      worksheet['!cols'] = colWidths;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'التقرير');

    // تحويل إلى Buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return excelBuffer;
  } catch (error) {
    console.error('Generate Excel error:', error);
    throw new Error('فشل في توليد ملف Excel');
  }
};

// ============================================
// توليد ملف Excel للشهادات
// ============================================
export const generateCertificatesExcel = (
  certificates: any[],
  options: ExcelOptions = {}
): Buffer => {
  const columns: ExcelColumn[] = [
    { key: 'certificateCode', label: 'كود الشهادة', width: 20 },
    { key: 'studentName', label: 'اسم الطالب', width: 20 },
    { key: 'courseName', label: 'اسم الدورة', width: 25 },
    { key: 'completionDate', label: 'تاريخ الاجتياز', width: 18 },
    { key: 'grade', label: 'التقدير', width: 10 },
    { key: 'academyName', label: 'الأكاديمية', width: 25 },
    { key: 'academyLicenseNumber', label: 'رقم الاعتماد', width: 18 },
    { key: 'issuedAt', label: 'تاريخ الإصدار', width: 18 },
  ];

  const formattedCertificates = certificates.map(cert => ({
    ...cert,
    completionDate: cert.completionDate instanceof Date ? cert.completionDate : new Date(cert.completionDate),
    issuedAt: cert.issuedAt instanceof Date ? cert.issuedAt : new Date(cert.issuedAt),
  }));

  return generateExcel(formattedCertificates, columns, {
    title: 'تقرير الشهادات الصادرة',
    ...options,
  });
};

// ============================================
// توليد ملف Excel للأكاديميات
// ============================================
export const generateAcademiesExcel = (
  academies: any[],
  options: ExcelOptions = {}
): Buffer => {
  const columns: ExcelColumn[] = [
    { key: 'academyId', label: 'معرف الأكاديمية', width: 20 },
    { key: 'name', label: 'اسم الأكاديمية', width: 25 },
    { key: 'taxNumber', label: 'رقم البطاقة الضريبية', width: 18 },
    { key: 'licenseNumber', label: 'رقم الاعتماد', width: 18 },
    { key: 'branchesCount', label: 'عدد الفروع', width: 12 },
    { key: 'createdAt', label: 'تاريخ التسجيل', width: 18 },
  ];

  const formattedAcademies = academies.map(academy => ({
    ...academy,
    branchesCount: academy.branches?.length || 0,
    createdAt: academy.createdAt instanceof Date ? academy.createdAt : new Date(academy.createdAt),
  }));

  return generateExcel(formattedAcademies, columns, {
    title: 'تقرير الأكاديميات المعتمدة',
    ...options,
  });
};

// ============================================
// توليد ملف Excel للنشاطات
// ============================================
export const generateActivitiesExcel = (
  activities: any[],
  options: ExcelOptions = {}
): Buffer => {
  const columns: ExcelColumn[] = [
    { key: 'userName', label: 'اسم المستخدم', width: 20 },
    { key: 'userEmail', label: 'البريد الإلكتروني', width: 25 },
    { key: 'type', label: 'نوع النشاط', width: 20 },
    { key: 'description', label: 'الوصف', width: 30 },
    { key: 'timestamp', label: 'التاريخ والوقت', width: 20 },
    { key: 'ipAddress', label: 'عنوان IP', width: 15 },
    { key: 'userAgent', label: 'المتصفح', width: 20 },
  ];

  const formattedActivities = activities.map(activity => ({
    ...activity,
    timestamp: activity.timestamp instanceof Date ? activity.timestamp : new Date(activity.timestamp),
  }));

  return generateExcel(formattedActivities, columns, {
    title: 'تقرير سجل النشاطات',
    ...options,
  });
};

// ============================================
// توليد ملف Excel لسجل البحث
// ============================================
export const generateSearchLogsExcel = (
  searchLogs: any[],
  options: ExcelOptions = {}
): Buffer => {
  const columns: ExcelColumn[] = [
    { key: 'searchType', label: 'نوع البحث', width: 15 },
    { key: 'searchValue', label: 'قيمة البحث', width: 20 },
    { key: 'searcherName', label: 'اسم الباحث', width: 20 },
    { key: 'searcherPhone', label: 'رقم الهاتف', width: 18 },
    { key: 'searcherEntity', label: 'الجهة', width: 25 },
    { key: 'searcherEntityType', label: 'نوع الجهة', width: 20 },
    { key: 'governorate', label: 'المحافظة', width: 15 },
    { key: 'timestamp', label: 'التاريخ والوقت', width: 20 },
    { key: 'resultCount', label: 'عدد النتائج', width: 12 },
  ];

  const formattedLogs = searchLogs.map(log => ({
    ...log,
    timestamp: log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp),
  }));

  return generateExcel(formattedLogs, columns, {
    title: 'تقرير سجل البحث',
    ...options,
  });
};

// ============================================
// توليد ملف Excel للتقارير المخصصة
// ============================================
export const generateCustomExcel = (
  data: any[],
  columns: { key: string; label: string }[],
  title: string,
  options: ExcelOptions = {}
): Buffer => {
  return generateExcel(data, columns, {
    title,
    ...options,
  });
};

// ============================================
// تصدير كملف CSV
// ============================================
export const generateCSV = (
  data: any[],
  columns: ExcelColumn[],
  options: ExcelOptions = {}
): string => {
  try {
    const {
      title = 'تقرير',
      generatedBy = 'نظام النقابة',
      committeeName = 'لجنة التحول الرقمي والتدريب',
      unionName = 'نقابة تكنولوجيا المعلومات والبرمجيات',
    } = options;

    // تنسيق التاريخ
    const now = formatEgyptDate(new Date());

    // إنشاء صفوف CSV
    const rows: string[] = [];

    // إضافة العنوان
    rows.push(`${unionName}`);
    rows.push(`${committeeName}`);
    rows.push('');
    rows.push(`${title}`);
    rows.push(`تاريخ التقرير: ${now}`);
    rows.push(`تم إنشاؤه بواسطة: ${generatedBy}`);
    rows.push('');

    // إضافة رأس الجدول
    const headers = columns.map(col => col.label);
    rows.push(headers.join(','));

    // إضافة البيانات
    data.forEach((item) => {
      const row = columns.map(col => {
        const value = item[col.key];
        if (value instanceof Date) {
          return formatEgyptDate(value);
        }
        if (typeof value === 'boolean') {
          return value ? 'نعم' : 'لا';
        }
        if (value === null || value === undefined) {
          return '-';
        }
        // تنظيف القيمة من الفواصل والاقتباسات
        const str = String(value);
        if (str.includes(',') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      rows.push(row.join(','));
    });

    // إضافة تذييل
    rows.push('');
    rows.push(`© ${new Date().getFullYear()} ${unionName} - جميع الحقوق محفوظة`);

    return rows.join('\n');
  } catch (error) {
    console.error('Generate CSV error:', error);
    throw new Error('فشل في توليد ملف CSV');
  }
};

// ============================================
// تصدير الدوال
// ============================================
export default {
  generateExcel,
  generateCertificatesExcel,
  generateAcademiesExcel,
  generateActivitiesExcel,
  generateSearchLogsExcel,
  generateCustomExcel,
  generateCSV,
};
