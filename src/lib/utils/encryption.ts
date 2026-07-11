import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

// ============================================
// مفتاح التشفير من متغيرات البيئة
// ============================================
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_encryption_key_32bytes';
const SALT_ROUNDS = 10;

// ============================================
// تشفير النص باستخدام AES
// ============================================
export const encryptText = (text: string): string => {
  try {
    if (!text) return '';
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

// ============================================
// فك تشفير النص
// ============================================
export const decryptText = (encryptedText: string): string => {
  try {
    if (!encryptedText) return '';
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const text = decrypted.toString(CryptoJS.enc.Utf8);
    return text;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

// ============================================
// تشفير الكائنات
// ============================================
export const encryptObject = <T>(obj: T): string => {
  try {
    const jsonString = JSON.stringify(obj);
    return encryptText(jsonString);
  } catch (error) {
    console.error('Encrypt object error:', error);
    return '';
  }
};

// ============================================
// فك تشفير الكائنات
// ============================================
export const decryptObject = <T>(encryptedString: string): T | null => {
  try {
    const decrypted = decryptText(encryptedString);
    if (!decrypted) return null;
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error('Decrypt object error:', error);
    return null;
  }
};

// ============================================
// تشفير البيانات الحساسة (مثل أرقام البطاقات)
// ============================================
export const encryptSensitiveData = (data: string): string => {
  // إضافة طبقة إضافية من التشفير للبيانات الحساسة
  const salt = 'sensitive_salt_2026';
  const combined = data + salt;
  return encryptText(combined);
};

// ============================================
// فك تشفير البيانات الحساسة
// ============================================
export const decryptSensitiveData = (encryptedData: string): string => {
  const decrypted = decryptText(encryptedData);
  if (!decrypted) return '';
  // إزالة الملح
  const salt = 'sensitive_salt_2026';
  return decrypted.replace(salt, '');
};

// ============================================
// تشفير كلمة المرور باستخدام bcrypt
// ============================================
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Hash password error:', error);
    throw new Error('فشل في تشفير كلمة المرور');
  }
};

// ============================================
// التحقق من كلمة المرور
// ============================================
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Compare password error:', error);
    return false;
  }
};

// ============================================
// تشفير معرف المستخدم
// ============================================
export const encryptUserId = (userId: string): string => {
  return encryptText(userId);
};

// ============================================
// فك تشفير معرف المستخدم
// ============================================
export const decryptUserId = (encryptedUserId: string): string => {
  return decryptText(encryptedUserId);
};

// ============================================
// تشفير جلسة المستخدم
// ============================================
export const encryptSession = (sessionData: any): string => {
  return encryptObject(sessionData);
};

// ============================================
// فك تشفير جلسة المستخدم
// ============================================
export const decryptSession = (encryptedSession: string): any => {
  return decryptObject(encryptedSession);
};

// ============================================
// إنشاء رمز تحقق عشوائي
// ============================================
export const generateVerificationCode = (length: number = 6): string => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ============================================
// تشفير الرمز التحقق
// ============================================
export const encryptVerificationCode = (code: string): string => {
  return encryptText(code);
};

// ============================================
// فك تشفير الرمز التحقق
// ============================================
export const decryptVerificationCode = (encryptedCode: string): string => {
  return decryptText(encryptedCode);
};

// ============================================
// تشفير بيانات البطاقة الضريبية
// ============================================
export const encryptTaxNumber = (taxNumber: string): string => {
  return encryptSensitiveData(taxNumber);
};

// ============================================
// فك تشفير بيانات البطاقة الضريبية
// ============================================
export const decryptTaxNumber = (encryptedTaxNumber: string): string => {
  return decryptSensitiveData(encryptedTaxNumber);
};

// ============================================
// تشفير رقم الهاتف
// ============================================
export const encryptPhone = (phone: string): string => {
  return encryptSensitiveData(phone);
};

// ============================================
// فك تشفير رقم الهاتف
// ============================================
export const decryptPhone = (encryptedPhone: string): string => {
  return decryptSensitiveData(encryptedPhone);
};

// ============================================
// تشفير البريد الإلكتروني
// ============================================
export const encryptEmail = (email: string): string => {
  return encryptSensitiveData(email);
};

// ============================================
// فك تشفير البريد الإلكتروني
// ============================================
export const decryptEmail = (encryptedEmail: string): string => {
  return decryptSensitiveData(encryptedEmail);
};

// ============================================
// إنشاء توقيع رقمي بسيط
// ============================================
export const generateDigitalSignature = (data: string, secret: string = ENCRYPTION_KEY): string => {
  const hash = CryptoJS.HmacSHA256(data, secret);
  return hash.toString(CryptoJS.enc.Hex);
};

// ============================================
// التحقق من التوقيع الرقمي
// ============================================
export const verifyDigitalSignature = (
  data: string,
  signature: string,
  secret: string = ENCRYPTION_KEY
): boolean => {
  const expectedSignature = generateDigitalSignature(data, secret);
  return signature === expectedSignature;
};

// ============================================
// تشفير بيانات الشهادة
// ============================================
export const encryptCertificateData = (certificateData: any): string => {
  return encryptObject(certificateData);
};

// ============================================
// فك تشفير بيانات الشهادة
// ============================================
export const decryptCertificateData = (encryptedData: string): any => {
  return decryptObject(encryptedData);
};

// ============================================
// تشفير بيانات الأكاديمية
// ============================================
export const encryptAcademyData = (academyData: any): string => {
  return encryptObject(academyData);
};

// ============================================
// فك تشفير بيانات الأكاديمية
// ============================================
export const decryptAcademyData = (encryptedData: string): any => {
  return decryptObject(encryptedData);
};

// ============================================
// دوال مساعدة للتحقق من التشفير
// ============================================

// التحقق من صحة النص المشفر
export const isValidEncrypted = (text: string): boolean => {
  try {
    // محاولة فك التشفير
    const decrypted = decryptText(text);
    return decrypted !== '';
  } catch {
    return false;
  }
};

// التحقق من صحة الكائن المشفر
export const isValidEncryptedObject = <T>(text: string): boolean => {
  try {
    const decrypted = decryptObject<T>(text);
    return decrypted !== null;
  } catch {
    return false;
  }
};

// ============================================
// تصدير جميع الدوال
// ============================================
export default {
  encryptText,
  decryptText,
  encryptObject,
  decryptObject,
  encryptSensitiveData,
  decryptSensitiveData,
  hashPassword,
  comparePassword,
  encryptUserId,
  decryptUserId,
  encryptSession,
  decryptSession,
  generateVerificationCode,
  encryptVerificationCode,
  decryptVerificationCode,
  encryptTaxNumber,
  decryptTaxNumber,
  encryptPhone,
  decryptPhone,
  encryptEmail,
  decryptEmail,
  generateDigitalSignature,
  verifyDigitalSignature,
  encryptCertificateData,
  decryptCertificateData,
  encryptAcademyData,
  decryptAcademyData,
  isValidEncrypted,
  isValidEncryptedObject,
};
