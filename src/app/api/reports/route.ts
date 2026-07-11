import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase/config';
import { getAllAcademies, getAllCertificates, getSearchLogs } from '@/lib/firebase/firestore';
import { generateReportPDF } from '@/lib/pdf/generator';
import { generateExcel, generateCertificatesExcel, generateAcademiesExcel, generateSearchLogsExcel } from '@/lib/excel/generator';
import { logActivity } from '@/lib/firebase/firestore';

// ============================================
// الحصول على المستخدم من الطلب
// ============================================
const getUserFromRequest = async (request: NextRequest) => {
  try {
    const auth = getAuth(app);
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) return null;
    
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken) return null;
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: decodedToken.name || '',
      role: decodedToken.role || 'admin',
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};

// ============================================
// POST: توليد تقرير
// ============================================
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // التحقق من صلاحية الأدمن
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: تحتاج صلاحية أدمن' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reportType, format, startDate, endDate } = body;

    if (!reportType) {
      return NextResponse.json(
        { success: false, error: 'نوع التقرير مطلوب' },
        { status: 400 }
      );
    }

    if (!format) {
      return NextResponse.json(
        { success: false, error: 'صيغة التقرير مطلوبة' },
        { status: 400 }
      );
    }

    let data: any[] = [];
    let title = '';
    let buffer: Buffer = Buffer.from('');

    // جلب البيانات حسب نوع التقرير
    switch (reportType) {
      case 'certificates':
        data = await getAllCertificates();
        title = 'تقرير الشهادات الصادرة';
        
        // فلترة حسب التاريخ
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          data = data.filter((c) => {
            const date = c.issuedAt instanceof Date ? c.issuedAt : new Date(c.issuedAt);
            return date >= start && date <= end;
          });
        }

        if (format === 'pdf') {
          const columns = [
            { key: 'certificateCode', label: 'كود الشهادة' },
            { key: 'studentName', label: 'اسم الطالب' },
            { key: 'courseName', label: 'اسم الدورة' },
            { key: 'grade', label: 'التقدير' },
            { key: 'academyName', label: 'الأكاديمية' },
          ];
          buffer = await generateReportPDF(title, data, columns, user.displayName);
        } else {
          buffer = generateCertificatesExcel(data, {
            generatedBy: user.displayName,
            committeeName: 'لجنة التحول الرقمي والتدريب',
            unionName: 'نقابة تكنولوجيا المعلومات والبرمجيات',
          });
        }
        break;

      case 'academies':
        data = await getAllAcademies();
        title = 'تقرير الأكاديميات المعتمدة';

        if (format === 'pdf') {
          const columns = [
            { key: 'name', label: 'اسم الأكاديمية' },
            { key: 'licenseNumber', label: 'رقم الاعتماد' },
            { key: 'taxNumber', label: 'البطاقة الضريبية' },
            { key: 'branchesCount', label: 'عدد الفروع' },
          ];
          const formattedData = data.map((a) => ({
            ...a,
            branchesCount: a.branches?.length || 0,
          }));
          buffer = await generateReportPDF(title, formattedData, columns, user.displayName);
        } else {
          buffer = generateAcademiesExcel(data, {
            generatedBy: user.displayName,
            committeeName: 'لجنة التحول الرقمي والتدريب',
            unionName: 'نقابة تكنولوجيا المعلومات والبرمجيات',
          });
        }
        break;

      case 'searches':
        data = await getSearchLogs();
        title = 'تقرير عمليات البحث';

        // فلترة حسب التاريخ
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          data = data.filter((s) => {
            const date = s.timestamp instanceof Date ? s.timestamp : new Date(s.timestamp);
            return date >= start && date <= end;
          });
        }

        if (format === 'pdf') {
          const columns = [
            { key: 'searchType', label: 'نوع البحث' },
            { key: 'searchValue', label: 'قيمة البحث' },
            { key: 'searcherName', label: 'اسم الباحث' },
            { key: 'searcherEntity', label: 'الجهة' },
            { key: 'governorate', label: 'المحافظة' },
          ];
          buffer = await generateReportPDF(title, data, columns, user.displayName);
        } else {
          buffer = generateSearchLogsExcel(data, {
            generatedBy: user.displayName,
            committeeName: 'لجنة التحول الرقمي والتدريب',
            unionName: 'نقابة تكنولوجيا المعلومات والبرمجيات',
          });
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'نوع التقرير غير مدعوم' },
          { status: 400 }
        );
    }

    // تسجيل النشاط
    await logActivity({
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      userRole: user.role,
      type: 'generate_report',
      description: `توليد تقرير: ${title}`,
      details: {
        reportType,
        format,
        startDate,
        endDate,
        dataCount: data.length,
        generatedBy: user.email,
      },
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // إرجاع الملف
    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `${title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.${extension}`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء توليد التقرير' },
      { status: 500 }
    );
  }
}

// ============================================
// GET: الحصول على بيانات التقرير (JSON)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // التحقق من صلاحية الأدمن
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: تحتاج صلاحية أدمن' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!reportType) {
      return NextResponse.json(
        { success: false, error: 'نوع التقرير مطلوب' },
        { status: 400 }
      );
    }

    let data: any[] = [];
    let summary: any = {};

    switch (reportType) {
      case 'certificates':
        data = await getAllCertificates();
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          data = data.filter((c) => {
            const date = c.issuedAt instanceof Date ? c.issuedAt : new Date(c.issuedAt);
            return date >= start && date <= end;
          });
        }
        summary = {
          total: data.length,
          active: data.filter((c) => c.isActive).length,
          byGrade: data.reduce((acc: any, c: any) => {
            acc[c.grade] = (acc[c.grade] || 0) + 1;
            return acc;
          }, {}),
          byAcademy: data.reduce((acc: any, c: any) => {
            acc[c.academyName] = (acc[c.academyName] || 0) + 1;
            return acc;
          }, {}),
        };
        break;

      case 'academies':
        data = await getAllAcademies();
        summary = {
          total: data.length,
          totalBranches: data.reduce((acc, a) => acc + (a.branches?.length || 0), 0),
          byGovernorate: data.reduce((acc: any, a: any) => {
            a.branches?.forEach((b: any) => {
              acc[b.governorate] = (acc[b.governorate] || 0) + 1;
            });
            return acc;
          }, {}),
        };
        break;

      case 'searches':
        data = await getSearchLogs();
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          data = data.filter((s) => {
            const date = s.timestamp instanceof Date ? s.timestamp : new Date(s.timestamp);
            return date >= start && date <= end;
          });
        }
        summary = {
          total: data.length,
          byType: data.reduce((acc: any, s: any) => {
            acc[s.searchType] = (acc[s.searchType] || 0) + 1;
            return acc;
          }, {}),
          byGovernorate: data.reduce((acc: any, s: any) => {
            acc[s.governorate] = (acc[s.governorate] || 0) + 1;
            return acc;
          }, {}),
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'نوع التقرير غير مدعوم' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        data,
        summary,
        count: data.length,
        generatedAt: new Date(),
        generatedBy: user.displayName,
      },
    });
  } catch (error: any) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
