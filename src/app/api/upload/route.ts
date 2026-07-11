import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase/config';
import { uploadToCloudinary, uploadUnionLogo, uploadUnionStamp } from '@/lib/cloudinary/upload';
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
// POST: رفع ملف
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

    // التحقق من صلاحية السوبر أدمن لرفع اللوجو والختم
    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: تحتاج صلاحية سوبر أدمن' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'الملف مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'الرجاء رفع ملف صورة' },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (حد أقصى 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'حجم الصورة يجب أن يكون أقل من 5MB' },
        { status: 400 }
      );
    }

    // تحويل الملف إلى Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let result;
    let description = '';

    // رفع الملف حسب النوع
    switch (type) {
      case 'logo':
        result = await uploadUnionLogo(buffer);
        description = 'رفع لوجو النقابة';
        break;
      case 'stamp':
        result = await uploadUnionStamp(buffer);
        description = 'رفع ختم النقابة';
        break;
      default:
        result = await uploadToCloudinary(buffer, { folder });
        description = `رفع ملف: ${file.name}`;
        break;
    }

    // تسجيل النشاط
    await logActivity({
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      userRole: user.role,
      type: 'upload_logo',
      description,
      details: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        type,
        folder,
        url: result.secure_url,
        uploadedBy: user.email,
      },
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
      message: 'تم رفع الملف بنجاح',
    });
  } catch (error: any) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء رفع الملف' },
      { status: 500 }
    );
  }
}

// ============================================
// POST: رفع ملفات متعددة
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

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الملفات مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من الملفات
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'الرجاء رفع ملفات صور فقط' },
          { status: 400 }
        );
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'حجم الصورة يجب أن يكون أقل من 5MB' },
          { status: 400 }
        );
      }
    }

    // رفع الملفات
    const results = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { folder });
      results.push({
        url: result.secure_url,
        publicId: result.public_id,
        fileName: file.name,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      });
    }

    // تسجيل النشاط
    await logActivity({
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      userRole: user.role,
      type: 'upload_logo',
      description: `رفع ${files.length} ملفات`,
      details: {
        filesCount: files.length,
        folder,
        uploadedBy: user.email,
      },
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: results,
      message: `تم رفع ${files.length} ملف بنجاح`,
    });
  } catch (error: any) {
    console.error('PUT /api/upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء رفع الملفات' },
      { status: 500 }
    );
  }
}
