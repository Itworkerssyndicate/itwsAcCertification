import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase/config';
import { getActivities, getActivitiesByUser, logActivity } from '@/lib/firebase/firestore';
import { ActivityType } from '@/types';

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
// GET: الحصول على سجل النشاطات
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
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') as ActivityType | null;

    let activities;

    if (userId) {
      activities = await getActivitiesByUser(userId);
    } else {
      activities = await getActivities();
    }

    // فلترة حسب النوع
    if (type) {
      activities = activities.filter((a) => a.type === type);
    }

    // تحديد العدد
    activities = activities.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: activities,
      count: activities.length,
    });
  } catch (error: any) {
    console.error('GET /api/activities error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// POST: إضافة نشاط جديد (للتسجيل التلقائي)
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
    const { type, description, details } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'نوع النشاط مطلوب' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'وصف النشاط مطلوب' },
        { status: 400 }
      );
    }

    const result = await logActivity({
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      userRole: user.role,
      type: type as ActivityType,
      description,
      details: details || {},
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { activityId: result.activityId },
        message: 'تم تسجيل النشاط بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'فشل تسجيل النشاط' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('POST /api/activities error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// GET: إحصائيات النشاطات
// ============================================
export async function HEAD(request: NextRequest) {
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

    const activities = await getActivities();

    // حساب الإحصائيات
    const stats = {
      total: activities.length,
      byType: activities.reduce((acc: any, a: any) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {}),
      byUser: activities.reduce((acc: any, a: any) => {
        acc[a.userId] = (acc[a.userId] || 0) + 1;
        return acc;
      }, {}),
      today: activities.filter((a) => {
        const today = new Date();
        const date = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        return date.toDateString() === today.toDateString();
      }).length,
      thisWeek: activities.filter((a) => {
        const now = new Date();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const date = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        return date >= weekStart;
      }).length,
      thisMonth: activities.filter((a) => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const date = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        return date >= monthStart;
      }).length,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('HEAD /api/activities error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
