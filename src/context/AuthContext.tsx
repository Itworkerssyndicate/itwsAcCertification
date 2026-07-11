'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getCurrentUser, logoutUser, loginUser } from '@/lib/firebase/auth';
import { logActivity } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ============================================
// واجهة السياق
// ============================================
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasPermission: (requiredRole: 'admin' | 'super_admin') => boolean;
}

// ============================================
// إنشاء السياق
// ============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// مزود السياق
// ============================================
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // ============================================
  // تحديث المستخدم
  // ============================================
  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
    }
  };

  // ============================================
  // تسجيل الدخول
  // ============================================
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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
  };

  // ============================================
  // تسجيل الخروج
  // ============================================
  const logout = async (): Promise<void> => {
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
  };

  // ============================================
  // التحقق من الصلاحيات
  // ============================================
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const hasPermission = (requiredRole: 'admin' | 'super_admin'): boolean => {
    if (!user) return false;
    if (requiredRole === 'super_admin') return user.role === 'super_admin';
    if (requiredRole === 'admin') return user.role === 'admin' || user.role === 'super_admin';
    return false;
  };

  // ============================================
  // تحميل المستخدم عند بدء التشغيل
  // ============================================
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };
    initAuth();
  }, []);

  // ============================================
  // القيم المصدرة
  // ============================================
  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// هوك استخدام السياق
// ============================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================
// تصدير افتراضي
// ============================================
export default AuthContext;
