'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Activity,
  BarChart3,
  Settings,
  Users,
  Image,
  LogOut,
  Home,
  Search,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
} from 'lucide-react';

// ============================================
// واجهة خصائص القائمة الجانبية
// ============================================
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// واجهة عنصر القائمة
// ============================================
interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: 'admin' | 'super_admin';
  children?: MenuItem[];
}

// ============================================
// مكون القائمة الجانبية
// ============================================
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const { hasPermission, isAdmin, isSuperAdmin } = usePermissions();

  // ============================================
  // عناصر القائمة
  // ============================================
  const menuItems: MenuItem[] = [
    {
      label: 'الرئيسية',
      href: '/',
      icon: Home,
    },
    {
      label: 'لوحة التحكم',
      href: '/dashboard/admin',
      icon: LayoutDashboard,
      permission: 'admin',
    },
    {
      label: 'الأكاديميات',
      href: '/dashboard/admin/academies',
      icon: Building2,
      permission: 'admin',
    },
    {
      label: 'الشهادات',
      href: '/dashboard/admin/certificates',
      icon: FileText,
      permission: 'admin',
    },
    {
      label: 'سجل النشاطات',
      href: '/dashboard/admin/activities',
      icon: Activity,
      permission: 'admin',
    },
    {
      label: 'التقارير',
      href: '/dashboard/admin/reports',
      icon: BarChart3,
      permission: 'admin',
    },
    {
      label: 'إدارة المستخدمين',
      href: '/dashboard/admin/settings/users',
      icon: Users,
      permission: 'super_admin',
    },
    {
      label: 'إعدادات النظام',
      href: '/dashboard/admin/settings',
      icon: Settings,
      permission: 'super_admin',
    },
    {
      label: 'رفع اللوجو والختم',
      href: '/dashboard/admin/settings/logo',
      icon: Image,
      permission: 'super_admin',
    },
  ];

  // ============================================
  // تصفية العناصر حسب الصلاحيات
  // ============================================
  const filteredItems = menuItems.filter((item) => {
    if (!item.permission) return true;
    if (item.permission === 'admin') return isAdmin;
    if (item.permission === 'super_admin') return isSuperAdmin;
    return true;
  });

  // ============================================
  // التحقق من أن الرابط نشط
  // ============================================
  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === href;
    return pathname?.startsWith(href) || false;
  };

  // ============================================
  // تسجيل الخروج
  // ============================================
  const handleLogout = async () => {
    await logout();
    onClose();
  };

  // ============================================
  // عنصر القائمة
  // ============================================
  const MenuItemComponent = ({ item }: { item: MenuItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
          ${active
            ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/20'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
          }
        `}
      >
        <Icon size={20} className={active ? 'text-primary-500' : ''} />
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  // ============================================
  // القائمة الجانبية على الشاشات الكبيرة
  // ============================================
  return (
    <>
      {/* خلفية مظللة للهواتف */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* القائمة الجانبية */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed top-0 right-0 h-full w-72 z-50
          bg-white dark:bg-dark-600
          border-l border-gray-200 dark:border-gray-700
          shadow-2xl
          flex flex-col
          lg:static lg:translate-x-0 lg:shadow-none lg:border-l-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* رأس القائمة */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ن.ت</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              نقابة تكنولوجيا المعلومات
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* معلومات المستخدم */}
        {isAuthenticated && user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                {user.displayName?.charAt(0) || 'م'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {user.displayName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
              <div className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500">
                {user.role === 'super_admin' ? 'سوبر أدمن' : 'أدمن'}
              </div>
            </div>
          </div>
        )}

        {/* روابط القائمة */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredItems.map((item) => (
            <MenuItemComponent key={item.href} item={item} />
          ))}
        </nav>

        {/* تذييل القائمة */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">تسجيل الخروج</span>
            </button>
          ) : (
            <Link
              href="/auth/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
            >
              تسجيل الدخول
            </Link>
          )}
          <div className="text-xs text-center text-gray-400 dark:text-gray-500">
            {process.env.NEXT_PUBLIC_APP_NAME} v1.0.0
          </div>
        </div>
      </motion.aside>
    </>
  );
};

// ============================================
// تصدير افتراضي
// ============================================
export default Sidebar;
