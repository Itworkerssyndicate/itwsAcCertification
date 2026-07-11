import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

// ============================================
// تهيئة الخط
// ============================================
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-cairo',
});

// ============================================
// بيانات الميتا
// ============================================
export const metadata: Metadata = {
  title: 'نقابة تكنولوجيا المعلومات - منصة توثيق الشهادات',
  description: 'منصة توثيق شهادات الدورات التدريبية الصادرة عن الأكاديميات المعتمدة من نقابة تكنولوجيا المعلومات والبرمجيات - لجنة التحول الرقمي والتدريب',
  keywords: 'نقابة تكنولوجيا المعلومات, توثيق الشهادات, التحول الرقمي, التدريب, الأكاديميات المعتمدة',
  authors: [{ name: 'لجنة التحول الرقمي والتدريب' }],
  robots: 'index, follow',
  openGraph: {
    title: 'نقابة تكنولوجيا المعلومات - منصة توثيق الشهادات',
    description: 'منصة توثيق شهادات الدورات التدريبية الصادرة عن الأكاديميات المعتمدة',
    type: 'website',
    locale: 'ar_EG',
  },
};

// ============================================
// تخطيط الجذر
// ============================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0055e6" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-arabic bg-gradient-tech min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a2e',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                direction: 'rtl',
                textAlign: 'right',
              },
              success: {
                style: {
                  border: '1px solid #22c55e',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#1a1a2e',
                },
              },
              error: {
                style: {
                  border: '1px solid #ef4444',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1a1a2e',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
