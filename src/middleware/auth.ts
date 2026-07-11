import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/auth';

// ============================================
// المسارات العامة (لا تحتاج مصادقة)
// ============================================
const PUBLIC_PATHS = [
  '/',
  '/public',
  '/public/verify',
  '/public/search',
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/certificates/verify',
];

// ============================================
// المسارات التي تحتاج إلى أدمن
// ============================================
const ADMIN_PATHS = [
  '/dashboard/admin',
  '/dashboard/admin/academies',
  '/dashboard/admin/academies/add',
  '/dashboard/admin/academies/edit',
  '/dashboard/admin/certificates',
  '/dashboard/admin/certificates/add',
  '/dashboard/admin/certificates/edit',
  '/dashboard/admin/settings',
  '/dashboard/admin/settings/logo',
  '/dashboard/admin/settings/users',
  '/dashboard/admin/activities',
  '/dashboard/admin/reports',
];

// ============================================
// المسارات التي تحتاج إلى سوبر أدمن
// ============================================
const SUPER_ADMIN_PATHS = [
  '/dashboard/admin/settings/users',
  '/dashboard/admin/settings/logo',
  '/api/users',
  '/api/users/create',
  '/api/users/delete',
];

// ============================================
// التحقق من أن المسار عام
// ============================================
const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
};

// ============================================
// التحقق من أن المسار يحتاج إلى أدمن
// ============================================
const isAdminPath = (path: string): boolean => {
  return ADMIN_PATHS.some(adminPath => path.startsWith(adminPath));
};

// ============================================
// التحقق من أن المسار يحتاج إلى سوبر أدمن
// ============================================
const isSuperAdminPath = (path: string): boolean => {
  return SUPER_ADMIN_PATHS.some(superPath => path.startsWith(superPath));
};

// ============================================
// Middleware الرئيسي
// ============================================
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ============================================
  // السماح للمسارات العامة
  // ============================================
  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  // ============================================
  // التحقق من المصادقة
  // ============================================
  try {
    const user = await getCurrentUser();

    // إذا لم يكن المستخدم مسجل الدخول
    if (!user) {
      // إذا كان المسار يتطلب مصادقة
      if (isAdminPath(path) || isSuperAdminPath(path)) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // ============================================
    // التحقق من صلاحيات السوبر أدمن
    // ============================================
    if (isSuperAdminPath(path)) {
      if (user.role !== 'super_admin') {
        // إذا كان المستخدم ليس سوبر أدمن
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
    }

    // ============================================
    // التحقق من صلاحيات الأدمن
    // ============================================
    if (isAdminPath(path)) {
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        // إذا كان المستخدم ليس أدمن أو سوبر أدمن
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // ============================================
    // منع الوصول إلى صفحات المصادقة إذا كان المستخدم مسجل الدخول
    // ============================================
    if (path.startsWith('/auth/') && user) {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // في حالة الخطأ، إعادة توجيه إلى صفحة تسجيل الدخول
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }
}

// ============================================
// تكوين المسارات التي سيتم تطبيق middleware عليها
// ============================================
export const config = {
  matcher: [
    /*
     * تطبيق على جميع المسارات باستثناء:
     * - _next/static (الملفات الثابتة)
     * - _next/image (صور Next.js)
     * - favicon.ico (أيقونة الموقع)
     * - public (المجلد العام)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
