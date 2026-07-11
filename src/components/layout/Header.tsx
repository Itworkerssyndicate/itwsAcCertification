'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Shield,
  Bell,
  Search,
  Home,
  FileText,
  Building2,
  BarChart3,
  Activity,
  Users,
  ChevronDown,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

// ============================================
// واجهة خصائص الهيدر
// ============================================
interface HeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

// ============================================
// مكون الهيدر
// ============================================
export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  sidebarOpen,
}) => {
  const { user, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // ============================================
  // روابط التنقل
  // ============================================
  const navLinks = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/public/search', label: 'بحث', icon: Search },
    { href: '/public/verify', label: 'تحقق', icon: FileText },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'لوحة التحكم', icon: BarChart3 },
    { href: '/dashboard/admin/academies', label: 'الأكاديميات', icon: Building2 },
    { href: '/dashboard/admin/certificates', label: 'الشهادات', icon: FileText },
    { href: '/dashboard/admin/activities', label: 'النشاطات', icon: Activity },
    { href: '/dashboard/admin/reports', label: 'التقارير', icon: BarChart3 },
  ];

  const superAdminLinks = [
    { href: '/dashboard/admin/settings/users', label: 'المستخدمين', icon: Users },
    { href: '/dashboard/admin/settings', label: 'الإعدادات', icon: Settings },
  ];

  // ============================================
  // الحصول على اسم الصفحة الحالية
  // ============================================
  const getPageTitle = () => {
    const path = pathname || '/';
    if (path === '/') return 'الرئيسية';
    if (path === '/public/search') return 'بحث';
    if (path === '/public/verify') return 'تحقق';
    if (path.includes('/dashboard/admin')) {
      if (path.includes('/academies')) return 'إدارة الأكاديميات';
      if (path.includes('/certificates')) return 'إدارة الشهادات';
      if (path.includes('/activities')) return 'سجل النشاطات';
      if (path.includes('/reports')) return 'التقارير';
      if (path.includes('/settings')) return 'الإعدادات';
      return 'لوحة التحكم';
    }
    return 'المنصة';
  };

  // ============================================
  // تسجيل الخروج
  // ============================================
  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-600/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* الجانب الأيسر */}
        <div className="flex items-center gap-3">
          {/* زر القائمة الجانبية */}
          {isAuthenticated && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
              aria-label="تبديل القائمة"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {/* شعار النقابة */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ن.ت</span>
            </div>
            <span className="hidden sm:block font-bold text-gray-900 dark:text-white">
              نقابة تكنولوجيا المعلومات
            </span>
          </Link>

          {/* عنوان الصفحة */}
          <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mr-4">
            {getPageTitle()}
          </span>
        </div>

        {/* الجانب الأيمن */}
        <div className="flex items-center gap-2">
          {/* روابط التنقل السريع (للمسجلين) */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {adminLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-colors
                    ${pathname === link.href
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* زر الإشعارات */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="الإشعارات"
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* قائمة المستخدم */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="قائمة المستخدم"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.displayName?.charAt(0) || 'م'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.displayName || 'مستخدم'}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {/* القائمة المنسدلة للمستخدم */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-dark-600 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* معلومات المستخدم */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-500">
                      {user.role === 'super_admin' ? 'سوبر أدمن' : 'أدمن'}
                    </div>
                  </div>

                  {/* الروابط */}
                  <div className="p-2">
                    <Link
                      href="/dashboard/admin"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={18} className="text-gray-400" />
                      <span className="text-sm">الملف الشخصي</span>
                    </Link>

                    {isSuperAdmin && (
                      <Link
                        href="/dashboard/admin/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield size={18} className="text-gray-400" />
                        <span className="text-sm">الإعدادات</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="text-sm">تسجيل الخروج</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            // أزرار تسجيل الدخول والتسجيل
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ============================================
// تصدير افتراضي
// ============================================
export default Header;
