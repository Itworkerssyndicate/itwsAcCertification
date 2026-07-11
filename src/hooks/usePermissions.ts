'use client';

import { useAuth } from './useAuth';
import { UserRole } from '@/types';

// ============================================
// واجهة صلاحيات المستخدم
// ============================================
interface Permissions {
  canViewDashboard: boolean;
  canManageAcademies: boolean;
  canManageCertificates: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewActivities: boolean;
  canViewReports: boolean;
  canDelete: boolean;
  canUploadLogo: boolean;
  canUploadStamp: boolean;
  canExportPDF: boolean;
  canExportExcel: boolean;
  canCreateAdmin: boolean;
  canDeleteUser: boolean;
  canViewAllData: boolean;
  canEditAllData: boolean;
  canDeleteAllData: boolean;
}

// ============================================
// صلاحيات الأدمن العادي
// ============================================
const ADMIN_PERMISSIONS: Permissions = {
  canViewDashboard: true,
  canManageAcademies: true,
  canManageCertificates: true,
  canManageUsers: false,
  canManageSettings: false,
  canViewActivities: true,
  canViewReports: true,
  canDelete: false,
  canUploadLogo: false,
  canUploadStamp: false,
  canExportPDF: true,
  canExportExcel: true,
  canCreateAdmin: false,
  canDeleteUser: false,
  canViewAllData: true,
  canEditAllData: true,
  canDeleteAllData: false,
};

// ============================================
// صلاحيات السوبر أدمن
// ============================================
const SUPER_ADMIN_PERMISSIONS: Permissions = {
  canViewDashboard: true,
  canManageAcademies: true,
  canManageCertificates: true,
  canManageUsers: true,
  canManageSettings: true,
  canViewActivities: true,
  canViewReports: true,
  canDelete: true,
  canUploadLogo: true,
  canUploadStamp: true,
  canExportPDF: true,
  canExportExcel: true,
  canCreateAdmin: true,
  canDeleteUser: true,
  canViewAllData: true,
  canEditAllData: true,
  canDeleteAllData: true,
};

// ============================================
// صلاحيات الزائر (غير مسجل)
// ============================================
const GUEST_PERMISSIONS: Permissions = {
  canViewDashboard: false,
  canManageAcademies: false,
  canManageCertificates: false,
  canManageUsers: false,
  canManageSettings: false,
  canViewActivities: false,
  canViewReports: false,
  canDelete: false,
  canUploadLogo: false,
  canUploadStamp: false,
  canExportPDF: false,
  canExportExcel: false,
  canCreateAdmin: false,
  canDeleteUser: false,
  canViewAllData: false,
  canEditAllData: false,
  canDeleteAllData: false,
};

// ============================================
// هوك صلاحيات المستخدم
// ============================================
export const usePermissions = (): {
  permissions: Permissions;
  userRole: UserRole | null;
  hasPermission: (permission: keyof Permissions) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
} => {
  const { user, isAuthenticated } = useAuth();

  // تحديد الصلاحيات بناءً على دور المستخدم
  const getPermissions = (): Permissions => {
    if (!isAuthenticated || !user) {
      return GUEST_PERMISSIONS;
    }

    if (user.role === 'super_admin') {
      return SUPER_ADMIN_PERMISSIONS;
    }

    if (user.role === 'admin') {
      return ADMIN_PERMISSIONS;
    }

    return GUEST_PERMISSIONS;
  };

  const permissions = getPermissions();
  const userRole = user?.role || null;

  // التحقق من صلاحية معينة
  const hasPermission = (permission: keyof Permissions): boolean => {
    return permissions[permission] || false;
  };

  // التحقق من دور معين
  const hasRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  return {
    permissions,
    userRole,
    hasPermission,
    hasRole,
    isAdmin: userRole === 'admin' || userRole === 'super_admin',
    isSuperAdmin: userRole === 'super_admin',
    isAuthenticated,
  };
};

// ============================================
// تصدير افتراضي
// ============================================
export default usePermissions;
