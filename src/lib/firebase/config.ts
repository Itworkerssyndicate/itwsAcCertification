import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// ============================================
// تهيئة Firebase Config
// ============================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ============================================
// تهيئة التطبيق - منع إعادة التهيئة
// ============================================
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ============================================
// تهيئة المصادقة مع استمرارية الجلسة
// ============================================
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// ============================================
// تهيئة Firestore
// ============================================
const db = initializeFirestore(app, {});

// ============================================
// تهيئة التخزين
// ============================================
const storage = getStorage(app);

// ============================================
// تهيئة Analytics (فقط في المتصفح)
// ============================================
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// ============================================
// تصدير الخدمات
// ============================================
export { app, auth, db, storage, analytics };

// ============================================
// التحقق من صحة الاتصال
// ============================================
export const isFirebaseReady = (): boolean => {
  try {
    return !!app && !!auth && !!db;
  } catch {
    return false;
  }
};

// ============================================
// دوال مساعدة للتاريخ - كل شيء من Firebase
// ============================================
export const getEgyptTime = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
};

export const getEgyptTimestamp = (): string => {
  return getEgyptTime().toISOString();
};

export const formatEgyptDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Africa/Cairo',
  });
};

export const formatEgyptDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Africa/Cairo',
  });
};
