import { v2 as cloudinary } from 'cloudinary';

// ============================================
// تهيئة Cloudinary
// ============================================
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ============================================
// واجهات الدوال
// ============================================
interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: Record<string, any>[];
}

interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

// ============================================
// رفع ملف إلى Cloudinary
// ============================================
export const uploadToCloudinary = async (
  file: Buffer | string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const folder = options.folder || process.env.CLOUDINARY_FOLDER || 'itwsAcCertification';
    
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      public_id: options.public_id,
      transformation: options.transformation || [{ quality: 'auto', fetch_format: 'auto' }],
      resource_type: 'auto',
    });

    return {
      url: result.url,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('فشل رفع الملف إلى Cloudinary');
  }
};

// ============================================
// رفع عدة ملفات إلى Cloudinary
// ============================================
export const uploadMultipleToCloudinary = async (
  files: Buffer[],
  options: UploadOptions = {}
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, options));
  return await Promise.all(uploadPromises);
};

// ============================================
// حذف ملف من Cloudinary
// ============================================
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// ============================================
// الحصول على رابط محسن من Cloudinary
// ============================================
export const getOptimizedUrl = (publicId: string, options: Record<string, any> = {}): string => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    dpr: 'auto',
    ...options,
  };

  return cloudinary.url(publicId, {
    ...defaultOptions,
    secure: true,
  });
};

// ============================================
// الحصول على رابط مصغر
// ============================================
export const getThumbnailUrl = (publicId: string, width: number = 200, height: number = 200): string => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width, height, crop: 'fill', gravity: 'center' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

// ============================================
// الحصول على رابط مع علامة مائية
// ============================================
export const getWatermarkedUrl = (publicId: string, watermarkPublicId: string): string => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { overlay: watermarkPublicId, opacity: 30, width: 200, height: 200, gravity: 'center' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

// ============================================
// دوال خاصة بالشهادات
// ============================================

// رفع صورة الشهادة
export const uploadCertificateImage = async (
  file: Buffer,
  certificateCode: string
): Promise<UploadResult> => {
  return await uploadToCloudinary(file, {
    folder: `${process.env.CLOUDINARY_FOLDER}/certificates/${certificateCode}`,
    public_id: `certificate_${certificateCode}`,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 1200, height: 800, crop: 'limit' },
    ],
  });
};

// رفع توقيع الشهادة
export const uploadCertificateSignature = async (
  file: Buffer,
  certificateCode: string
): Promise<UploadResult> => {
  return await uploadToCloudinary(file, {
    folder: `${process.env.CLOUDINARY_FOLDER}/certificates/${certificateCode}`,
    public_id: `signature_${certificateCode}`,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 300, height: 100, crop: 'limit' },
      { background: 'transparent' },
    ],
  });
};

// ============================================
// دوال خاصة بالأكاديميات
// ============================================

// رفع صورة الأكاديمية
export const uploadAcademyImage = async (
  file: Buffer,
  academyId: string
): Promise<UploadResult> => {
  return await uploadToCloudinary(file, {
    folder: `${process.env.CLOUDINARY_FOLDER}/academies/${academyId}`,
    public_id: `academy_${academyId}`,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 800, height: 600, crop: 'limit' },
    ],
  });
};

// ============================================
// دوال خاصة باللوجو والختم
// ============================================

// رفع لوجو النقابة
export const uploadUnionLogo = async (file: Buffer): Promise<UploadResult> => {
  return await uploadToCloudinary(file, {
    folder: `${process.env.CLOUDINARY_FOLDER}/union`,
    public_id: 'union_logo',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 500, height: 500, crop: 'limit' },
    ],
  });
};

// رفع ختم النقابة
export const uploadUnionStamp = async (file: Buffer): Promise<UploadResult> => {
  return await uploadToCloudinary(file, {
    folder: `${process.env.CLOUDINARY_FOLDER}/union`,
    public_id: 'union_stamp',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 300, height: 300, crop: 'limit' },
      { background: 'transparent' },
    ],
  });
};

// الحصول على لوجو النقابة
export const getUnionLogoUrl = (): string => {
  return cloudinary.url(`${process.env.CLOUDINARY_FOLDER}/union/union_logo`, {
    secure: true,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 200, height: 200, crop: 'limit' },
    ],
  });
};

// الحصول على ختم النقابة
export const getUnionStampUrl = (): string => {
  return cloudinary.url(`${process.env.CLOUDINARY_FOLDER}/union/union_stamp`, {
    secure: true,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 150, height: 150, crop: 'limit' },
      { background: 'transparent' },
    ],
  });
};

// ============================================
// دوال خاصة بالتقارير
// ============================================

// رفع تقرير PDF
export const uploadReportPDF = async (
  file: Buffer,
  reportName: string
): Promise<UploadResult> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return await uploadToCloudinary(file, {
    folder: `${process.env.CLOUDINARY_FOLDER}/reports`,
    public_id: `${reportName}_${timestamp}`,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

// ============================================
// دوال مساعدة للصور
// ============================================

// تغيير حجم الصورة
export const resizeImage = (publicId: string, width: number, height: number): string => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width, height, crop: 'fill', gravity: 'center' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

// إضافة تأثيرات على الصورة
export const applyEffects = (
  publicId: string,
  effects: { sepia?: number; blur?: number; brightness?: number; contrast?: number }
): string => {
  const transformations: any[] = [];
  
  if (effects.sepia) {
    transformations.push({ effect: `sepia:${effects.sepia}` });
  }
  if (effects.blur) {
    transformations.push({ effect: `blur:${effects.blur}` });
  }
  if (effects.brightness) {
    transformations.push({ effect: `brightness:${effects.brightness}` });
  }
  if (effects.contrast) {
    transformations.push({ effect: `contrast:${effects.contrast}` });
  }
  
  transformations.push({ quality: 'auto', fetch_format: 'auto' });
  
  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations,
  });
};

export default cloudinary;
