'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Award,
  Users,
  Building2,
} from 'lucide-react';

// ============================================
// مكون التذييل
// ============================================
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // ============================================
  // روابط سريعة
  // ============================================
  const quickLinks = [
    { label: 'الرئيسية', href: '/' },
    { label: 'بحث عن شهادة', href: '/public/search' },
    { label: 'التحقق من شهادة', href: '/public/verify' },
    { label: 'الأكاديميات المعتمدة', href: '/public/academies' },
  ];

  const adminLinks = [
    { label: 'لوحة التحكم', href: '/dashboard/admin' },
    { label: 'إدارة الأكاديميات', href: '/dashboard/admin/academies' },
    { label: 'إدارة الشهادات', href: '/dashboard/admin/certificates' },
    { label: 'التقارير', href: '/dashboard/admin/reports' },
  ];

  const contactInfo = [
    { icon: MapPin, text: 'القاهرة - مصر الجديدة - شارع النقابات' },
    { icon: Phone, text: '+20 2 12345678' },
    { icon: Mail, text: 'info@itws.org.eg' },
    { icon: Clock, text: 'الأحد - الخميس: 9:00 ص - 5:00 م' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'فيسبوك' },
    { icon: Twitter, href: '#', label: 'تويتر' },
    { icon: Linkedin, href: '#', label: 'لينكدإن' },
    { icon: Youtube, href: '#', label: 'يوتيوب' },
  ];

  return (
    <footer className="bg-dark-500 text-white/80">
      {/* القسم العلوي */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* معلومات النقابة */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">ن.ت</span>
              </div>
              <span className="text-xl font-bold text-white">
                نقابة تكنولوجيا المعلومات
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              منصة توثيق شهادات الدورات التدريبية الصادرة عن الأكاديميات المعتمدة من نقابة تكنولوجيا المعلومات والبرمجيات.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} className="text-gray-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* روابط الإدارة */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">لوحة التحكم</h4>
            <ul className="space-y-2">
              {adminLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* معلومات الاتصال */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <item.icon size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* شعارات الجودة */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-primary-500" />
                <span className="text-xs text-gray-400">معتمد</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={20} className="text-primary-500" />
                <span className="text-xs text-gray-400">جودة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* القسم السفلي */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} نقابة تكنولوجيا المعلومات والبرمجيات - جميع الحقوق محفوظة
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                سياسة الخصوصية
              </Link>
              <span className="w-px h-4 bg-gray-600"></span>
              <Link href="/terms" className="hover:text-white transition-colors">
                شروط الاستخدام
              </Link>
              <span className="w-px h-4 bg-gray-600"></span>
              <span className="flex items-center gap-1">
                <span>لجنة التحول الرقمي والتدريب</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// تصدير افتراضي
// ============================================
export default Footer;
