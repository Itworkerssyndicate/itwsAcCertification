'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { getCurrentUser, loginUser, logoutUser, resetPassword, updateUser } from '@/lib/firebase/auth';
import { logActivity } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ============================================
// واجهة هوك المصادقة
// ============================================
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasPermission: (requiredRole: 'admin' | 'super_admin') => boolean;
}

// ============================================
// هوك المصادقة
// ============================================
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // ============================================
  // تحديث المستخدم
  // ============================================
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // تسجيل الدخول
  // ============================================
  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        
        // تسجيل نشاط الدخول
        await logActivity({
          userId: result.user.uid,
          userEmail: result.user.email,
          userName: result.user.displayName,
          userRole: result.user.role,
          type: 'login',
          description: 'تسجيل دخول',
          details: {
            email: result.user.email,
            role: result.user.role,
          },
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
        });
        
        toast.success('مرحباً بك في المنصة');
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  }, []);

  // ============================================
  // تسجيل الخروج
  // ============================================
  const logout = useCallback(async (): Promise<void> => {
    try {
      if (user) {
        // تسجيل نشاط الخروج
        await logActivity({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          userRole: user.role,
          type: 'logout',
          description: 'تسجيل خروج',
          details: {
            email: user.email,
          },
          ipAddress: 'auto',
          userAgent: navigator.userAgent,
        });
      }
      
      await logoutUser();
      setUser(null);
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  }, [user, router]);

  // ============================================
  // إعادة تعيين كلمة المرور
  // ============================================
  const resetPasswordHandler = useCallback(async (email: string) => {
    try {
      const result = await resetPassword(email);
      if (result.success) {
        toast.success('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني');
      } else {
        toast.error(result.error || 'حدث خطأ أثناء إرسال رابط إعادة التعيين');
      }
      return result;
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' };
    }
  }, []);

  // ============================================
  // تحديث بيانات المستخدم
  // ============================================
  const updateUserHandler = useCallback(async (data: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'المستخدم غير مسجل الدخول' };
      }
      
      const result = await updateUser(user.uid, data);
      if (result.success) {
        await refreshUser();
        toast.success('تم تحديث بيانات المستخدم بنجاح');
      } else {
        toast.error(result.error || 'حدث خطأ أثناء تحديث البيانات');
      }
      return result;
    } catch (error: any) {
      console.error('Update user error:', error);
      return { success: false, error: 'حدث خطأ أثناء تحديث بيانات المستخدم' };
    }
  }, [user, refreshUser]);

  // ============================================
  // التحقق من الصلاحيات
  // ============================================
  const isAuthenticated = !!user && user.isActive !== false;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const hasPermission = useCallback((requiredRole: 'admin' | 'super_admin'): boolean => {
    if (!user) return false;
    if (requiredRole === 'super_admin') return user.role === 'super_admin';
    if (requiredRole === 'admin') return user.role === 'admin' || user.role === 'super_admin';
    return false;
  }, [user]);

  // ============================================
  // تحميل المستخدم عند بدء التشغيل
  // ============================================
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ============================================
  // القيم المصدرة
  // ============================================
  return {
    user,
    loading,
    login,
    logout,
    resetPassword: resetPasswordHandler,
    updateUser: updateUserHandler,
    refreshUser,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    hasPermission,
  };
};

// ============================================
// تصدير افتراضي
// ============================================
export default useAuth;
