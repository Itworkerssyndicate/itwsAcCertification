import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase/config';
import {
  getAllAcademies,
  getAcademyById,
  addAcademy,
  updateAcademy,
  deleteAcademy,
} from '@/lib/firebase/firestore';
import { logActivity } from '@/lib/firebase/firestore';
import { Academy, User } from '@/types';

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
    
    // هنا يمكن جلب بيانات المستخدم من Firestore
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
// GET: الحصول على جميع الأكاديميات
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
    const id = searchParams.get('id');
    const license = searchParams.get('license');

    if (id) {
      const academy = await getAcademyById(id);
      if (!academy) {
        return NextResponse.json(
          { success: false, error: 'الأكاديمية غير موجودة' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: academy });
    }

    if (license) {
      // البحث بالرقم الاعتمادي
      const academies = await getAllAcademies();
      const academy = academies.find((a) => a.licenseNumber === license);
      if (!academy) {
        return NextResponse.json(
          { success: false, error: 'الأكاديمية غير موجودة' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: academy });
    }

    const academies = await getAllAcademies();
    return NextResponse.json({ success: true, data: academies });
  } catch (error: any) {
    console.error('GET /api/academies error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// POST: إضافة أكاديمية جديدة
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
    const { name, taxNumber, licenseNumber, branches } = body;

    // التحقق من البيانات
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'اسم الأكاديمية مطلوب' },
        { status: 400 }
      );
    }
    if (!taxNumber) {
      return NextResponse.json(
        { success: false, error: 'رقم البطاقة الضريبية مطلوب' },
        { status: 400 }
      );
    }
    if (!licenseNumber) {
      return NextResponse.json(
        { success: false, error: 'رقم الاعتماد مطلوب' },
        { status: 400 }
      );
    }
    if (!branches || branches.length === 0) {
      return NextResponse.json(
        { success: false, error: 'يجب إضافة فرع واحد على الأقل' },
        { status: 400 }
      );
    }

    const academyData = {
      name,
      taxNumber,
      licenseNumber,
      branches,
      createdBy: user.uid,
      updatedBy: user.uid,
      isDeleted: false,
    };

    const result = await addAcademy(academyData);

    if (result.success) {
      // تسجيل النشاط
      await logActivity({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        userRole: user.role,
        type: 'create_academy',
        description: `إضافة أكاديمية جديدة: ${name}`,
        details: {
          academyName: name,
          licenseNumber,
          branchesCount: branches.length,
          createdBy: user.email,
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({
        success: true,
        data: { academyId: result.academyId },
        message: 'تم إضافة الأكاديمية بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'فشل إضافة الأكاديمية' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('POST /api/academies error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT: تحديث أكاديمية
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الأكاديمية مطلوب' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, taxNumber, licenseNumber, branches } = body;

    const updateData: Partial<Academy> = {};
    if (name) updateData.name = name;
    if (taxNumber) updateData.taxNumber = taxNumber;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    if (branches) updateData.branches = branches;
    updateData.updatedBy = user.uid;

    const result = await updateAcademy(id, updateData);

    if (result.success) {
      // تسجيل النشاط
      await logActivity({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        userRole: user.role,
        type: 'update_academy',
        description: `تحديث أكاديمية: ${name || id}`,
        details: {
          academyId: id,
          updatedBy: user.email,
          changes: updateData,
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({
        success: true,
        message: 'تم تحديث الأكاديمية بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'فشل تحديث الأكاديمية' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('PUT /api/academies error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE: حذف أكاديمية (للسوبر أدمن فقط)
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
    const id = searchParams.get('id');
    const reason = searchParams.get('reason') || 'تم الحذف من قبل الإدارة';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الأكاديمية مطلوب' },
        { status: 400 }
      );
    }

    const result = await deleteAcademy(id, user.uid, reason);

    if (result.success) {
      // تسجيل النشاط
      await logActivity({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        userRole: user.role,
        type: 'delete_academy',
        description: `حذف أكاديمية: ${id}`,
        details: {
          academyId: id,
          reason,
          deletedBy: user.email,
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({
        success: true,
        message: 'تم حذف الأكاديمية بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'فشل حذف الأكاديمية' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('DELETE /api/academies error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
