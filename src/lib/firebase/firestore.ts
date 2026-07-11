import { db, getEgyptTime } from './config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { Academy, Certificate, AcademyBranch, SearchLog, ActivityLog } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// دوال مساعدة عامة
// ============================================

// إنشاء معرف فريد
export const generateId = (): string => {
  return uuidv4();
};

// توليد كود شهادة فريد
export const generateCertificateCode = (): string => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NTI-CERT-${year}-${random}`;
};

// ============================================
// دوال الأكاديميات
// ============================================

// إضافة أكاديمية جديدة
export const addAcademy = async (
  academyData: Omit<Academy, 'academyId' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; academyId?: string; error?: string }> => {
  try {
    const academyId = generateId();
    const now = getEgyptTime();
    
    const newAcademy: Academy = {
      ...academyData,
      academyId,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    await setDoc(doc(db, 'academies', academyId), newAcademy);
    
    return { success: true, academyId };
  } catch (error: any) {
    console.error('Add academy error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء إضافة الأكاديمية',
    };
  }
};

// الحصول على أكاديمية بالمعرف
export const getAcademyById = async (academyId: string): Promise<Academy | null> => {
  try {
    const docRef = doc(db, 'academies', academyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Academy;
    }
    return null;
  } catch (error) {
    console.error('Get academy error:', error);
    return null;
  }
};

// الحصول على أكاديمية بالرقم الاعتمادي
export const getAcademyByLicense = async (licenseNumber: string): Promise<Academy | null> => {
  try {
    const q = query(
      collection(db, 'academies'),
      where('licenseNumber', '==', licenseNumber),
      where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Academy;
    }
    return null;
  } catch (error) {
    console.error('Get academy by license error:', error);
    return null;
  }
};

// الحصول على جميع الأكاديميات
export const getAllAcademies = async (): Promise<Academy[]> => {
  try {
    const q = query(
      collection(db, 'academies'),
      where('isDeleted', '==', false),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const academies: Academy[] = [];
    querySnapshot.forEach((doc) => {
      academies.push(doc.data() as Academy);
    });
    return academies;
  } catch (error) {
    console.error('Get all academies error:', error);
    return [];
  }
};

// تحديث أكاديمية
export const updateAcademy = async (
  academyId: string,
  data: Partial<Academy>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const docRef = doc(db, 'academies', academyId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: getEgyptTime(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Update academy error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تحديث الأكاديمية',
    };
  }
};

// حذف أكاديمية (Soft Delete)
export const deleteAcademy = async (
  academyId: string,
  deletedBy: string,
  deletionReason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const docRef = doc(db, 'academies', academyId);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: getEgyptTime(),
      deletedBy,
      deletionReason,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete academy error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء حذف الأكاديمية',
    };
  }
};

// ============================================
// دوال الشهادات
// ============================================

// إضافة شهادة جديدة
export const addCertificate = async (
  certificateData: Omit<Certificate, 'certificateCode' | 'issuedAt' | 'updatedAt'>
): Promise<{ success: boolean; certificateCode?: string; error?: string }> => {
  try {
    const certificateCode = generateCertificateCode();
    const now = getEgyptTime();
    
    const newCertificate: Certificate = {
      ...certificateData,
      certificateCode,
      issuedAt: now,
      updatedAt: now,
      isActive: true,
    };

    await setDoc(doc(db, 'certificates', certificateCode), newCertificate);
    
    return { success: true, certificateCode };
  } catch (error: any) {
    console.error('Add certificate error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء إضافة الشهادة',
    };
  }
};

// الحصول على شهادة بالكود
export const getCertificateByCode = async (certificateCode: string): Promise<Certificate | null> => {
  try {
    const docRef = doc(db, 'certificates', certificateCode);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Certificate;
    }
    return null;
  } catch (error) {
    console.error('Get certificate error:', error);
    return null;
  }
};

// الحصول على جميع الشهادات
export const getAllCertificates = async (): Promise<Certificate[]> => {
  try {
    const q = query(
      collection(db, 'certificates'),
      where('isActive', '==', true),
      orderBy('issuedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const certificates: Certificate[] = [];
    querySnapshot.forEach((doc) => {
      certificates.push(doc.data() as Certificate);
    });
    return certificates;
  } catch (error) {
    console.error('Get all certificates error:', error);
    return [];
  }
};

// الحصول على شهادات بأكاديمية معينة
export const getCertificatesByAcademy = async (academyId: string): Promise<Certificate[]> => {
  try {
    const q = query(
      collection(db, 'certificates'),
      where('academyId', '==', academyId),
      where('isActive', '==', true),
      orderBy('issuedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const certificates: Certificate[] = [];
    querySnapshot.forEach((doc) => {
      certificates.push(doc.data() as Certificate);
    });
    return certificates;
  } catch (error) {
    console.error('Get certificates by academy error:', error);
    return [];
  }
};

// تحديث شهادة
export const updateCertificate = async (
  certificateCode: string,
  data: Partial<Certificate>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const docRef = doc(db, 'certificates', certificateCode);
    await updateDoc(docRef, {
      ...data,
      updatedAt: getEgyptTime(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Update certificate error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تحديث الشهادة',
    };
  }
};

// حذف شهادة (Soft Delete)
export const deleteCertificate = async (
  certificateCode: string,
  deletedBy: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const docRef = doc(db, 'certificates', certificateCode);
    await updateDoc(docRef, {
      isActive: false,
      deletedAt: getEgyptTime(),
      deletedBy,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete certificate error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء حذف الشهادة',
    };
  }
};

// ============================================
// دوال البحث
// ============================================

// البحث عن شهادة بالكود
export const searchCertificate = async (code: string): Promise<Certificate | null> => {
  try {
    const q = query(
      collection(db, 'certificates'),
      where('certificateCode', '==', code),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Certificate;
    }
    return null;
  } catch (error) {
    console.error('Search certificate error:', error);
    return null;
  }
};

// البحث عن أكاديمية بالرقم الاعتمادي
export const searchAcademyByLicense = async (licenseNumber: string): Promise<Academy | null> => {
  try {
    const q = query(
      collection(db, 'academies'),
      where('licenseNumber', '==', licenseNumber),
      where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Academy;
    }
    return null;
  } catch (error) {
    console.error('Search academy error:', error);
    return null;
  }
};

// ============================================
// دوال سجل البحث
// ============================================

// تسجيل عملية بحث
export const logSearch = async (
  searchData: Omit<SearchLog, 'searchId' | 'timestamp'>
): Promise<{ success: boolean; searchId?: string; error?: string }> => {
  try {
    const searchId = generateId();
    const now = getEgyptTime();
    
    const newLog: SearchLog = {
      ...searchData,
      searchId,
      timestamp: now,
    };

    await setDoc(doc(db, 'searchLogs', searchId), newLog);
    
    return { success: true, searchId };
  } catch (error: any) {
    console.error('Log search error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تسجيل البحث',
    };
  }
};

// الحصول على سجل البحث
export const getSearchLogs = async (): Promise<SearchLog[]> => {
  try {
    const q = query(
      collection(db, 'searchLogs'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const logs: SearchLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as SearchLog);
    });
    return logs;
  } catch (error) {
    console.error('Get search logs error:', error);
    return [];
  }
};

// ============================================
// دوال سجل النشاطات
// ============================================

// تسجيل نشاط
export const logActivity = async (
  activityData: Omit<ActivityLog, 'activityId' | 'timestamp'>
): Promise<{ success: boolean; activityId?: string; error?: string }> => {
  try {
    const activityId = generateId();
    const now = getEgyptTime();
    
    const newActivity: ActivityLog = {
      ...activityData,
      activityId,
      timestamp: now,
    };

    await setDoc(doc(db, 'activities', activityId), newActivity);
    
    return { success: true, activityId };
  } catch (error: any) {
    console.error('Log activity error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تسجيل النشاط',
    };
  }
};

// الحصول على سجل النشاطات
export const getActivities = async (): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(db, 'activities'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const activities: ActivityLog[] = [];
    querySnapshot.forEach((doc) => {
      activities.push(doc.data() as ActivityLog);
    });
    return activities;
  } catch (error) {
    console.error('Get activities error:', error);
    return [];
  }
};

// الحصول على نشاطات مستخدم معين
export const getActivitiesByUser = async (userId: string): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const activities: ActivityLog[] = [];
    querySnapshot.forEach((doc) => {
      activities.push(doc.data() as ActivityLog);
    });
    return activities;
  } catch (error) {
    console.error('Get activities by user error:', error);
    return [];
  }
};
