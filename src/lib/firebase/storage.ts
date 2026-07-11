import { storage } from './config';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  uploadString,
  UploadTask,
  UploadResult,
} from 'firebase/storage';

// ============================================
// رفع ملف إلى Firebase Storage
// ============================================
export const uploadFile = async (
  file: File,
  path: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const finalFileName = fileName || file.name;
    const storageRef = ref(storage, `${path}/${finalFileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    
    return { success: true, url };
  } catch (error: any) {
    console.error('Upload file error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء رفع الملف',
    };
  }
};

// ============================================
// رفع ملف كـ Base64
// ============================================
export const uploadBase64 = async (
  base64String: string,
  path: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    const snapshot = await uploadString(storageRef, base64String, 'data_url');
    const url = await getDownloadURL(snapshot.ref);
    
    return { success: true, url };
  } catch (error: any) {
    console.error('Upload base64 error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء رفع الملف',
    };
  }
};

// ============================================
// رفع ملف نصي
// ============================================
export const uploadText = async (
  text: string,
  path: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    const snapshot = await uploadString(storageRef, text, 'raw');
    const url = await getDownloadURL(snapshot.ref);
    
    return { success: true, url };
  } catch (error: any) {
    console.error('Upload text error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء رفع الملف النصي',
    };
  }
};

// ============================================
// رفع ملف JSON
// ============================================
export const uploadJSON = async (
  data: any,
  path: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const jsonString = JSON.stringify(data);
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    const snapshot = await uploadString(storageRef, jsonString, 'raw', {
      contentType: 'application/json',
    });
    const url = await getDownloadURL(snapshot.ref);
    
    return { success: true, url };
  } catch (error: any) {
    console.error('Upload JSON error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء رفع ملف JSON',
    };
  }
};

// ============================================
// الحصول على رابط تحميل الملف
// ============================================
export const getFileURL = async (
  path: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const storageRef = ref(storage, `${path}/${fileName}`);
    const url = await getDownloadURL(storageRef);
    return { success: true, url };
  } catch (error: any) {
    console.error('Get file URL error:', error);
    return {
      success: false,
      error: 'الملف غير موجود',
    };
  }
};

// ============================================
// حذف ملف
// ============================================
export const deleteFile = async (
  path: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const storageRef = ref(storage, `${path}/${fileName}`);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error: any) {
    console.error('Delete file error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء حذف الملف',
    };
  }
};

// ============================================
// الحصول على جميع الملفات في مجلد
// ============================================
export const listFiles = async (
  path: string
): Promise<{ success: boolean; files?: string[]; error?: string }> => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    const files = result.items.map((item) => item.name);
    return { success: true, files };
  } catch (error: any) {
    console.error('List files error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء جلب الملفات',
    };
  }
};

// ============================================
// الحصول على معلومات الملف
// ============================================
export const getFileMetadata = async (
  path: string,
  fileName: string
): Promise<{ success: boolean; metadata?: any; error?: string }> => {
  try {
    const storageRef = ref(storage, `${path}/${fileName}`);
    const metadata = await getMetadata(storageRef);
    return { success: true, metadata };
  } catch (error: any) {
    console.error('Get file metadata error:', error);
    return {
      success: false,
      error: 'الملف غير موجود',
    };
  }
};

// ============================================
// دوال مساعدة للشهادات
// ============================================

// رفع صورة الشهادة
export const uploadCertificateImage = async (
  file: File,
  certificateCode: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  return await uploadFile(file, `certificates/${certificateCode}`, `certificate_${certificateCode}.jpg`);
};

// رفع ملف PDF للشهادة
export const uploadCertificatePDF = async (
  pdfBuffer: Buffer,
  certificateCode: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const storageRef = ref(storage, `certificates/${certificateCode}/certificate_${certificateCode}.pdf`);
    
    const snapshot = await uploadBytes(storageRef, pdfBuffer, {
      contentType: 'application/pdf',
    });
    const url = await getDownloadURL(snapshot.ref);
    
    return { success: true, url };
  } catch (error: any) {
    console.error('Upload certificate PDF error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء رفع ملف PDF',
    };
  }
};

// ============================================
// دوال مساعدة للوجو والختم
// ============================================

// رفع لوجو النقابة
export const uploadUnionLogo = async (
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  return await uploadFile(file, 'union', 'logo.png');
};

// رفع ختم النقابة
export const uploadUnionStamp = async (
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  return await uploadFile(file, 'union', 'stamp.png');
};

// الحصول على لوجو النقابة
export const getUnionLogo = async (): Promise<{ success: boolean; url?: string; error?: string }> => {
  return await getFileURL('union', 'logo.png');
};

// الحصول على ختم النقابة
export const getUnionStamp = async (): Promise<{ success: boolean; url?: string; error?: string }> => {
  return await getFileURL('union', 'stamp.png');
};

// ============================================
// دوال مساعدة للتقارير
// ============================================

// رفع تقرير
export const uploadReport = async (
  file: File,
  reportName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return await uploadFile(file, `reports`, `${reportName}_${timestamp}.${file.name.split('.').pop()}`);
};

// رفع تقرير PDF
export const uploadReportPDF = async (
  pdfBuffer: Buffer,
  reportName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const storageRef = ref(storage, `reports/${reportName}_${timestamp}.pdf`);
    
    const snapshot = await uploadBytes(storageRef, pdfBuffer, {
      contentType: 'application/pdf',
    });
    const url = await getDownloadURL(snapshot.ref);
    
    return { success: true, url };
  } catch (error: any) {
    console.error('Upload report PDF error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء رفع التقرير',
    };
  }
};
