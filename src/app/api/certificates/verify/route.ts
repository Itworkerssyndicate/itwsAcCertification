import { NextRequest, NextResponse } from 'next/server';
import { getCertificateByCode, logSearch } from '@/lib/firebase/firestore';
import { searchValidationSchema } from '@/lib/utils/validators';

// ============================================
// POST: التحقق من شهادة
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, searcherName, searcherPhone, searcherEntity, searcherEntityType, governorate } = body;

    // التحقق من البيانات
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'كود الشهادة مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من صحة البيانات
    const validation = searchValidationSchema.safeParse({
      searchType: 'certificate',
      value: code,
      searcherName: searcherName || 'زائر',
      searcherPhone: searcherPhone || 'غير متاح',
      searcherEntity: searcherEntity || 'مستخدم عام',
      searcherEntityType: searcherEntityType || 'فرد',
      governorate: governorate || 'غير محدد',
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // البحث عن الشهادة
    const certificate = await getCertificateByCode(code);

    // تسجيل عملية البحث
    await logSearch({
      searchType: 'certificate',
      searchValue: code,
      searcherName: searcherName || 'زائر',
      searcherPhone: searcherPhone || 'غير متاح',
      searcherEntity: searcherEntity || 'مستخدم عام',
      searcherEntityType: searcherEntityType || 'فرد',
      governorate: governorate || 'غير محدد',
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      resultCount: certificate ? 1 : 0,
    });

    if (!certificate) {
      return NextResponse.json({
        success: false,
        message: 'لم يتم العثور على شهادة بهذا الكود',
        data: null,
      });
    }

    // التحقق من صلاحية الشهادة
    if (!certificate.isActive) {
      return NextResponse.json({
        success: false,
        message: 'هذه الشهادة غير نشطة أو تم إلغاؤها',
        data: null,
      });
    }

    // إرجاع بيانات الشهادة (مع إخفاء بعض البيانات الحساسة)
    return NextResponse.json({
      success: true,
      message: 'تم العثور على الشهادة',
      data: {
        certificateCode: certificate.certificateCode,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        academyName: certificate.academyName,
        academyLicenseNumber: certificate.academyLicenseNumber,
        issuedAt: certificate.issuedAt,
        isValid: certificate.isActive,
      },
    });
  } catch (error: any) {
    console.error('POST /api/certificates/verify error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// GET: التحقق من شهادة (عن طريق الكود في الرابط)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const searcherName = searchParams.get('name') || 'زائر';
    const searcherPhone = searchParams.get('phone') || 'غير متاح';
    const searcherEntity = searchParams.get('entity') || 'مستخدم عام';
    const searcherEntityType = searchParams.get('entityType') || 'فرد';
    const governorate = searchParams.get('governorate') || 'غير محدد';

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'كود الشهادة مطلوب' },
        { status: 400 }
      );
    }

    // البحث عن الشهادة
    const certificate = await getCertificateByCode(code);

    // تسجيل عملية البحث
    await logSearch({
      searchType: 'certificate',
      searchValue: code,
      searcherName,
      searcherPhone,
      searcherEntity,
      searcherEntityType,
      governorate,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      resultCount: certificate ? 1 : 0,
    });

    if (!certificate) {
      return NextResponse.json({
        success: false,
        message: 'لم يتم العثور على شهادة بهذا الكود',
        data: null,
      });
    }

    // التحقق من صلاحية الشهادة
    if (!certificate.isActive) {
      return NextResponse.json({
        success: false,
        message: 'هذه الشهادة غير نشطة أو تم إلغاؤها',
        data: null,
      });
    }

    // إرجاع بيانات الشهادة
    return NextResponse.json({
      success: true,
      message: 'تم العثور على الشهادة',
      data: {
        certificateCode: certificate.certificateCode,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        academyName: certificate.academyName,
        academyLicenseNumber: certificate.academyLicenseNumber,
        issuedAt: certificate.issuedAt,
        isValid: certificate.isActive,
      },
    });
  } catch (error: any) {
    console.error('GET /api/certificates/verify error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
