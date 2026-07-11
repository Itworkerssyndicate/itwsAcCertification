import { z } from 'zod';
import { EGYPTIAN_GOVERNORATES, GRADES } from './helpers';

// ============================================
// التحقق من صحة البيانات باستخدام Zod
// ============================================

// ============================================
// التحقق من البريد الإلكتروني
// ============================================
export const emailSchema = z
  .string()
  .min(1, 'البريد الإلكتروني مطلوب')
  .email('البريد الإلكتروني غير صحيح')
  .max(100, 'البريد الإلكتروني طويل جداً');

// ============================================
// التحقق من كلمة المرور
// ============================================
export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .max(50, 'كلمة المرور طويلة جداً')
  .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
  .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير')
  .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم')
  .regex(/[^A-Za-z0-9]/, 'كلمة المرور يجب أن تحتوي على رمز خاص');

// ============================================
// التحقق من رقم الهاتف
// ============================================
export const phoneSchema = z
  .string()
  .min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل')
  .max(11, 'رقم الهاتف يجب أن يكون 11 رقم كحد أقصى')
  .regex(/^[0-9]+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط')
  .regex(/^(010|011|012|015|02|03|04|05|06|07|08|09)/, 'رقم الهاتف غير صحيح');

// ============================================
// التحقق من الاسم
// ============================================
export const nameSchema = z
  .string()
  .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
  .max(100, 'الاسم طويل جداً')
  .regex(/^[\u0600-\u06FF\s]+$/, 'الاسم يجب أن يكون باللغة العربية فقط');

// ============================================
// التحقق من الاسم بالإنجليزية
// ============================================
export const englishNameSchema = z
  .string()
  .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
  .max(100, 'الاسم طويل جداً')
  .regex(/^[A-Za-z\s]+$/, 'الاسم يجب أن يكون باللغة الإنجليزية فقط');

// ============================================
// التحقق من الرقم القومي
// ============================================
export const nationalIdSchema = z
  .string()
  .length(14, 'الرقم القومي يجب أن يكون 14 رقم')
  .regex(/^[0-9]+$/, 'الرقم القومي يجب أن يحتوي على أرقام فقط');

// ============================================
// التحقق من العنوان
// ============================================
export const addressSchema = z
  .string()
  .min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل')
  .max(200, 'العنوان طويل جداً');

// ============================================
// التحقق من المحافظة
// ============================================
export const governorateSchema = z
  .string()
  .min(2, 'المحافظة مطلوبة')
  .refine((val) => EGYPTIAN_GOVERNORATES.includes(val), {
    message: 'المحافظة غير صحيحة',
  });

// ============================================
// التحقق من التقدير
// ============================================
export const gradeSchema = z
  .string()
  .min(1, 'التقدير مطلوب')
  .refine((val) => GRADES.includes(val), {
    message: 'التقدير غير صحيح',
  });

// ============================================
// التحقق من رقم البطاقة الضريبية
// ============================================
export const taxNumberSchema = z
  .string()
  .min(9, 'رقم البطاقة الضريبية يجب أن يكون 9 أرقام على الأقل')
  .max(14, 'رقم البطاقة الضريبية يجب أن يكون 14 رقم كحد أقصى')
  .regex(/^[0-9-]+$/, 'رقم البطاقة الضريبية غير صحيح');

// ============================================
// التحقق من الرقم الاعتمادي
// ============================================
export const licenseNumberSchema = z
  .string()
  .min(3, 'الرقم الاعتمادي مطلوب')
  .max(50, 'الرقم الاعتمادي طويل جداً')
  .regex(/^[A-Za-z0-9-]+$/, 'الرقم الاعتمادي غير صحيح');

// ============================================
// التحقق من اسم الدورة التدريبية
// ============================================
export const courseNameSchema = z
  .string()
  .min(2, 'اسم الدورة التدريبية مطلوب')
  .max(200, 'اسم الدورة التدريبية طويل جداً');

// ============================================
// التحقق من اسم الطالب
// ============================================
export const studentNameSchema = z
  .string()
  .min(2, 'اسم الطالب مطلوب')
  .max(100, 'اسم الطالب طويل جداً')
  .regex(/^[\u0600-\u06FF\s]+$/, 'اسم الطالب يجب أن يكون باللغة العربية');

// ============================================
// التحقق من كود الشهادة
// ============================================
export const certificateCodeSchema = z
  .string()
  .min(10, 'كود الشهادة غير صحيح')
  .max(20, 'كود الشهادة غير صحيح')
  .regex(/^NTI-CERT-\d{4}-[A-Z0-9]{6}$/, 'كود الشهادة غير صحيح');

// ============================================
// التحقق من معرف الأكاديمية
// ============================================
export const academyIdSchema = z
  .string()
  .min(10, 'معرف الأكاديمية غير صحيح')
  .max(50, 'معرف الأكاديمية غير صحيح');

// ============================================
// التحقق من التاريخ
// ============================================
export const dateSchema = z
  .string()
  .or(z.date())
  .refine((val) => {
    const d = typeof val === 'string' ? new Date(val) : val;
    return !isNaN(d.getTime());
  }, 'التاريخ غير صحيح');

// ============================================
// التحقق من التاريخ في الماضي
// ============================================
export const pastDateSchema = z
  .string()
  .or(z.date())
  .refine((val) => {
    const d = typeof val === 'string' ? new Date(val) : val;
    return !isNaN(d.getTime()) && d <= new Date();
  }, 'التاريخ يجب أن يكون في الماضي');

// ============================================
// التحقق من الرابط
// ============================================
export const urlSchema = z
  .string()
  .url('الرابط غير صحيح')
  .max(500, 'الرابط طويل جداً');

// ============================================
// التحقق من النص الطويل
// ============================================
export const descriptionSchema = z
  .string()
  .min(1, 'الوصف مطلوب')
  .max(1000, 'الوصف طويل جداً');

// ============================================
// قواعد التحقق للأكاديمية
// ============================================
export const academyValidationSchema = z.object({
  name: z.string().min(2, 'اسم الأكاديمية مطلوب').max(200, 'اسم الأكاديمية طويل جداً'),
  taxNumber: taxNumberSchema,
  licenseNumber: licenseNumberSchema,
  branches: z.array(z.object({
    branchId: z.string().min(1, 'معرف الفرع مطلوب'),
    governorate: governorateSchema,
    address: addressSchema,
    phone: phoneSchema,
    isMainBranch: z.boolean(),
  })).min(1, 'يجب إضافة فرع واحد على الأقل'),
});

// ============================================
// قواعد التحقق للشهادة
// ============================================
export const certificateValidationSchema = z.object({
  studentName: studentNameSchema,
  courseName: courseNameSchema,
  completionDate: pastDateSchema,
  grade: gradeSchema,
  academyId: academyIdSchema,
  branchId: z.string().min(1, 'معرف الفرع مطلوب'),
  academyName: z.string().min(2, 'اسم الأكاديمية مطلوب'),
  academyLicenseNumber: licenseNumberSchema,
});

// ============================================
// قواعد التحقق للمستخدم
// ============================================
export const userValidationSchema = z.object({
  email: emailSchema,
  displayName: nameSchema,
  phone: phoneSchema,
  role: z.enum(['admin', 'super_admin'], {
    errorMap: () => ({ message: 'الدور غير صحيح' }),
  }),
});

// ============================================
// قواعد التحقق للبحث
// ============================================
export const searchValidationSchema = z.object({
  searchType: z.enum(['certificate', 'academy'], {
    errorMap: () => ({ message: 'نوع البحث غير صحيح' }),
  }),
  value: z.string().min(1, 'قيمة البحث مطلوبة'),
  searcherName: nameSchema,
  searcherPhone: phoneSchema,
  searcherEntity: z.string().min(2, 'اسم الجهة مطلوب'),
  searcherEntityType: z.string().min(2, 'نوع الجهة مطلوب'),
  governorate: governorateSchema,
});

// ============================================
// قواعد التحقق لتسجيل الدخول
// ============================================
export const loginValidationSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// ============================================
// قواعد التحقق للتسجيل
// ============================================
export const registerValidationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: nameSchema,
  phone: phoneSchema,
  role: z.enum(['admin', 'super_admin']),
  adminCode: z.string().optional(),
});

// ============================================
// قواعد التحقق لإعادة تعيين كلمة المرور
// ============================================
export const resetPasswordValidationSchema = z.object({
  email: emailSchema,
});

// ============================================
// دوال مساعدة للتحقق
// ============================================

// التحقق من صحة البيانات
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; error?: string } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'حدث خطأ في التحقق من البيانات' };
  }
};

// التحقق من صحة البيانات وعرض جميع الأخطاء
export const validateDataFull = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map(e => e.message) };
    }
    return { success: false, errors: ['حدث خطأ في التحقق من البيانات'] };
  }
};

// ============================================
// تصدير جميع القواعد
// ============================================
export const validators = {
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  name: nameSchema,
  englishName: englishNameSchema,
  nationalId: nationalIdSchema,
  address: addressSchema,
  governorate: governorateSchema,
  grade: gradeSchema,
  taxNumber: taxNumberSchema,
  licenseNumber: licenseNumberSchema,
  courseName: courseNameSchema,
  studentName: studentNameSchema,
  certificateCode: certificateCodeSchema,
  academyId: academyIdSchema,
  date: dateSchema,
  pastDate: pastDateSchema,
  url: urlSchema,
  description: descriptionSchema,
  academy: academyValidationSchema,
  certificate: certificateValidationSchema,
  user: userValidationSchema,
  search: searchValidationSchema,
  login: loginValidationSchema,
  register: registerValidationSchema,
  resetPassword: resetPasswordValidationSchema,
};
