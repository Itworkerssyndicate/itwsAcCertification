import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase/config';
import {
  getAllCertificates,
  getCertificateByCode,
  addCertificate,
  updateCertificate,
  deleteCertificate,
} from '@/lib/firebase/firestore';
import { logActivity } from '@/lib/firebase/firestore';
import { Certificate, User } from '@/types';

// ============================================
// الحصول على المستخدم من الطلب
// ============================================
const getUserFromRequest = async (request: NextRequest): Promise<User | null> => {
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
      phone: '',
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};

// ============================================
// GET: الحصول على جميع الشهادات
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

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const academyId = searchParams.get('academyId');

    if (code) {
      const certificate = await getCertificateByCode(code);
      if (!certificate) {
        return NextResponse.json(
          { success: false, error: 'الشهادة غير موجودة' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: certificate });
    }

    let certificates = await getAllCertificates();

    if (academyId) {
      certificates = certificates.filter((c) => c.academyId === academyId);
    }

    return NextResponse.json({ success: true, data: certificates });
  } catch (error: any) {
    console.error('GET /api/certificates error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// POST: إضافة شهادة جديدة
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
    const {
      studentName,
      courseName,
      completionDate,
      grade,
      academyId,
      branchId,
      academyName,
      academyLicenseNumber,
    } = body;

    // التحقق من البيانات
    if (!studentName) {
      return NextResponse.json(
        { success: false, error: 'اسم الطالب مطلوب' },
        { status: 400 }
      );
    }
    if (!courseName) {
      return NextResponse.json(
        { success: false, error: 'اسم الدورة التدريبية مطلوب' },
        { status: 400 }
      );
    }
    if (!completionDate) {
      return NextResponse.json(
        { success: false, error: 'تاريخ الاجتياز مطلوب' },
        { status: 400 }
      );
    }
    if (!grade) {
      return NextResponse.json(
        { success: false, error: 'التقدير مطلوب' },
        { status: 400 }
      );
    }
    if (!academyId) {
      return NextResponse.json(
        { success: false, error: 'معرف الأكاديمية مطلوب' },
        { status: 400 }
      );
    }
    if (!branchId) {
      return NextResponse.json(
        { success: false, error: 'معرف الفرع مطلوب' },
        { status: 400 }
      );
    }

    const certificateData = {
      studentName,
      courseName,
      completionDate: new Date(completionDate),
      grade,
      academyId,
      branchId,
      academyName: academyName || '',
      academyLicenseNumber: academyLicenseNumber || '',
      issuedBy: user.uid,
      updatedBy: user.uid,
      isActive: true,
    };

    const result = await addCertificate(certificateData);

    if (result.success) {
      // تسجيل النشاط
      await logActivity({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        userRole: user.role,
        type: 'create_certificate',
        description: `إضافة شهادة جديدة: ${studentName}`,
        details: {
          certificateCode: result.certificateCode,
          studentName,
          courseName,
          grade,
          academyName,
          issuedBy: user.email,
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({
        success: true,
        data: { certificateCode: result.certificateCode },
        message: 'تم إضافة الشهادة بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'فشل إضافة الشهادة' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('POST /api/certificates error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT: تحديث شهادة
// ============================================
export async function PUT(request: NextRequest) {
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
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'كود الشهادة مطلوب' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      studentName,
      courseName,
      completionDate,
      grade,
      academyId,
      branchId,
      academyName,
      academyLicenseNumber,
      isActive,
    } = body;

    const updateData: Partial<Certificate> = {};
    if (studentName) updateData.studentName = studentName;
    if (courseName) updateData.courseName = courseName;
    if (completionDate) updateData.completionDate = new Date(completionDate);
    if (grade) updateData.grade = grade;
    if (academyId) updateData.academyId = academyId;
    if (branchId) updateData.branchId = branchId;
    if (academyName) updateData.academyName = academyName;
    if (academyLicenseNumber) updateData.academyLicenseNumber = academyLicenseNumber;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    updateData.updatedBy = user.uid;

    // التحقق من وجود الشهادة
    const existing = await getCertificateByCode(code);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'الشهادة غير موجودة' },
        { status: 404 }
      );
    }

    const result = await updateCertificate(code, updateData);

    if (result.success) {
      // تسجيل النشاط
      await logActivity({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        userRole: user.role,
        type: 'update_certificate',
        description: `تحديث شهادة: ${code}`,
        details: {
          certificateCode: code,
          updatedBy: user.email,
          changes: updateData,
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({
        success: true,
        message: 'تم تحديث الشهادة بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'فشل تحديث الشهادة' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('PUT /api/certificates error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE: حذف شهادة (للسوبر أدمن فقط)
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // التحقق من صلاحية السوبر أدمن
    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: تحتاج صلاحية سوبر أدمن' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'كود الشهادة مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود الشهادة
    const existing = await getCertificateByCode(code);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'الشهادة غير موجودة' },
        { status: 404 }
      );
    }

    const result = await deleteCertificate(code, user.uid);

    if (result.success) {
      // تسجيل النشاط
      await logActivity({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        userRole: user.role,
        type: 'delete_certificate',
        description: `حذف شهادة: ${code}`,
        details: {
          certificateCode: code,
          studentName: existing.studentName,
          deletedBy: user.email,
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({
        success: true,
        message: 'تم حذف الشهادة بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'فشل حذف الشهادة' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('DELETE /api/certificates error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
