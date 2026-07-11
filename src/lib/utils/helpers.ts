import { getEgyptTime, formatEgyptDate } from '../firebase/config';

// ============================================
// دوال مساعدة عامة
// ============================================

// التحقق من وجود قيمة
export const isNotEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

// التحقق من البريد الإلكتروني
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// التحقق من رقم الهاتف المصري
export const isValidEgyptianPhone = (phone: string): boolean => {
  const phoneRegex = /^(010|011|012|015|02|03|04|05|06|07|08|09)[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
};

// التحقق من الرقم القومي المصري
export const isValidNationalId = (id: string): boolean => {
  const idRegex = /^[0-9]{14}$/;
  return idRegex.test(id);
};

// ============================================
// دوال معالجة النصوص
// ============================================

// تنظيف النص
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/[<>]/g, '') // منع حقن HTML
    .replace(/\s+/g, ' ') // إزالة المسافات الزائدة
    .replace(/[^\w\s\u0600-\u06FF\-]/g, ''); // السماح بالعربية والإنجليزية والأرقام والمسافات
};

// تحويل النص إلى حروف كبيرة
export const toUpperCase = (text: string): string => {
  return text.toUpperCase();
};

// تحويل النص إلى حروف صغيرة
export const toLowerCase = (text: string): string => {
  return text.toLowerCase();
};

// تقطيع النص إلى كلمات
export const splitText = (text: string, separator: string = ' '): string[] => {
  return text.split(separator).filter(word => word.length > 0);
};

// ============================================
// دوال التاريخ والوقت
// ============================================

// الحصول على التاريخ الحالي بتوقيت مصر
export const getCurrentDate = (): Date => {
  return getEgyptTime();
};

// تنسيق التاريخ
export const formatDate = (date: Date | string): string => {
  return formatEgyptDate(date);
};

// الحصول على الفرق بين تاريخين بالأيام
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// الحصول على الفرق بين تاريخين بالساعات
export const getHoursDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
};

// التحقق من تاريخ منتهي الصلاحية
export const isExpired = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return getEgyptTime().getTime() > d.getTime();
};

// ============================================
// دوال الأرقام
// ============================================

// تنسيق الأرقام
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ar-EG');
};

// تنسيق العملة
export const formatCurrency = (num: number): string => {
  return `ج.م ${num.toLocaleString('ar-EG')}`;
};

// توليد رقم عشوائي
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============================================
// دوال المصفوفات
// ============================================

// ترتيب مصفوفة
export const sortArray = <T>(arr: T[], key: keyof T, ascending: boolean = true): T[] => {
  return [...arr].sort((a, b) => {
    const valA = a[key] as any;
    const valB = b[key] as any;
    if (valA < valB) return ascending ? -1 : 1;
    if (valA > valB) return ascending ? 1 : -1;
    return 0;
  });
};

// فلترة مصفوفة
export const filterArray = <T>(arr: T[], predicate: (item: T) => boolean): T[] => {
  return arr.filter(predicate);
};

// البحث في مصفوفة
export const findInArray = <T>(arr: T[], predicate: (item: T) => boolean): T | undefined => {
  return arr.find(predicate);
};

// ============================================
// دوال الكائنات
// ============================================

// نسخ كائن
export const cloneObject = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// دمج كائنات
export const mergeObjects = <T>(obj1: T, obj2: Partial<T>): T => {
  return { ...obj1, ...obj2 };
};

// حذف مفاتيح من كائن
export const omitKeys = <T>(obj: T, keys: (keyof T)[]): Partial<T> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// اختيار مفاتيح من كائن
export const pickKeys = <T>(obj: T, keys: (keyof T)[]): Partial<T> => {
  const result: Partial<T> = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// ============================================
// دوال المحافظات المصرية
// ============================================

// قائمة المحافظات المصرية
export const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الإسكندرية',
  'الجيزة',
  'القليوبية',
  'الشرقية',
  'الدقهلية',
  'المنوفية',
  'الغربية',
  'كفر الشيخ',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'شمال سيناء',
  'جنوب سيناء',
  'البحر الأحمر',
  'الأقصر',
  'أسوان',
  'أسيوط',
  'سوهاج',
  'قنا',
  'المنيا',
  'بني سويف',
  'الفيوم',
  'مطروح',
  'الوادي الجديد',
  'حلوان',
  'العاشر من رمضان',
];

// التحقق من وجود محافظة
export const isValidGovernorate = (governorate: string): boolean => {
  return EGYPTIAN_GOVERNORATES.includes(governorate);
};

// ============================================
// دوال التقديرات
// ============================================

// قائمة التقديرات
export const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

// التحقق من صحة التقدير
export const isValidGrade = (grade: string): boolean => {
  return GRADES.includes(grade);
};

// ============================================
// دوال توليد الأكواد
// ============================================

// توليد كود عشوائي
export const generateRandomCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// توليد كود شهادة
export const generateCertificateCode = (): string => {
  const year = new Date().getFullYear();
  const random = generateRandomCode(6);
  return `NTI-CERT-${year}-${random}`;
};

// ============================================
// دوال التحقق من الصلاحيات
// ============================================

// التحقق من صلاحية المستخدم
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  if (userRole === 'super_admin') return true;
  if (userRole === 'admin' && requiredRole === 'admin') return true;
  return false;
};

// ============================================
// دوال معالجة الأخطاء
// ============================================

// رسائل الخطأ
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'حدث خطأ في الشبكة، يرجى المحاولة مرة أخرى',
  UNAUTHORIZED: 'غير مصرح لك بالوصول إلى هذه الصفحة',
  NOT_FOUND: 'البيانات المطلوبة غير موجودة',
  SERVER_ERROR: 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى',
  VALIDATION_ERROR: 'البيانات المدخلة غير صحيحة',
  DUPLICATE_ENTRY: 'البيانات موجودة بالفعل',
  SESSION_EXPIRED: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
};

// الحصول على رسالة خطأ
export const getErrorMessage = (code: string): string => {
  return ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || 'حدث خطأ غير متوقع';
};
