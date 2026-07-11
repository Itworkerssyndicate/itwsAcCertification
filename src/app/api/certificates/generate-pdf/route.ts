import { NextRequest, NextResponse } from 'next/server';
import { getCertificateByCode } from '@/lib/firebase/firestore';
import { generateCertificatePDF } from '@/lib/pdf/generator';
import { logActivity } from '@/lib/firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase/config';

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
// POST: توليد PDF للشهادة
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

    const body = await request.json();
    const { certificateCode } = body;

    if (!certificateCode) {
      return NextResponse.json(
        { success: false, error: 'كود الشهادة مطلوب' },
        { status: 400 }
      );
    }

    // الحصول على بيانات الشهادة
    const certificate = await getCertificateByCode(certificateCode);
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'الشهادة غير موجودة' },
        { status: 404 }
      );
    }

    // التحقق من صلاحية الشهادة
    if (!certificate.isActive) {
      return NextResponse.json(
        { success: false, error: 'هذه الشهادة غير نشطة' },
        { status: 400 }
      );
    }

    // توليد PDF
    const pdfBuffer = await generateCertificatePDF({
      certificateCode: certificate.certificateCode,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      completionDate: certificate.completionDate,
      grade: certificate.grade,
      academyName: certificate.academyName,
      academyLicenseNumber: certificate.academyLicenseNumber,
    });

    // تسجيل النشاط
    await logActivity({
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      userRole: user.role,
      type: 'export_pdf',
      description: `تصدير PDF للشهادة: ${certificateCode}`,
      details: {
        certificateCode,
        studentName: certificate.studentName,
        generatedBy: user.email,
      },
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // إرجاع ملف PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate_${certificateCode}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('POST /api/certificates/generate-pdf error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء توليد PDF' },
      { status: 500 }
    );
  }
}

// ============================================
// GET: توليد PDF للشهادة (عن طريق الكود في الرابط)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateCode = searchParams.get('code');

    if (!certificateCode) {
      return NextResponse.json(
        { success: false, error: 'كود الشهادة مطلوب' },
        { status: 400 }
      );
    }

    // الحصول على بيانات الشهادة
    const certificate = await getCertificateByCode(certificateCode);
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'الشهادة غير موجودة' },
        { status: 404 }
      );
    }

    // التحقق من صلاحية الشهادة
    if (!certificate.isActive) {
      return NextResponse.json(
        { success: false, error: 'هذه الشهادة غير نشطة' },
        { status: 400 }
      );
    }

    // توليد PDF
    const pdfBuffer = await generateCertificatePDF({
      certificateCode: certificate.certificateCode,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      completionDate: certificate.completionDate,
      grade: certificate.grade,
      academyName: certificate.academyName,
      academyLicenseNumber: certificate.academyLicenseNumber,
    });

    // إرجاع ملف PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="certificate_${certificateCode}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('GET /api/certificates/generate-pdf error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء توليد PDF' },
      { status: 500 }
    );
  }
}
