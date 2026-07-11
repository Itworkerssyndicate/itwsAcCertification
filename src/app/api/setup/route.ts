import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { app, db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, collection, query, getDocs, deleteDoc } from 'firebase/firestore';
import { hashPassword } from '@/lib/utils/encryption';
import { User } from '@/types';
import { getEgyptTime } from '@/lib/firebase/config';

// ============================================
// الحصول على المستخدم من الطلب
// ============================================
const getUserFromRequest = async (request: NextRequest) => {
  try {
    const auth = getAuth(app);
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) return null;
    
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken) return null;
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: decodedToken.name || '',
      role: decodedToken.role || 'admin',
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};

// ============================================
// POST: تهيئة قاعدة البيانات
// ============================================
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // التحقق من صلاحية السوبر أدمن
    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: تحتاج صلاحية سوبر أدمن' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'الإجراء مطلوب' },
        { status: 400 }
      );
    }

    let result: any = {};

    switch (action) {
      case 'create_admin':
        result = await createAdminUser();
        break;
      case 'create_collections':
        result = await createCollections();
        break;
      case 'seed_data':
        result = await seedData();
        break;
      case 'reset_all':
        result = await resetAllData();
        break;
      case 'check_status':
        result = await checkStatus();
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'الإجراء غير معروف' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'تم تنفيذ الإجراء بنجاح',
    });
  } catch (error: any) {
    console.error('POST /api/setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// ============================================
// إنشاء مستخدم أدمن افتراضي
// ============================================
const createAdminUser = async () => {
  const adminEmail = 'superadmin@itws.com';
  const adminPassword = 'Admin@2026';

  try {
    const auth = getAuth(app);
    
    // التحقق من وجود المستخدم
    const userQuery = query(collection(db, 'users'));
    const querySnapshot = await getDocs(userQuery);
    let adminExists = false;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email === adminEmail) {
        adminExists = true;
      }
    });

    if (adminExists) {
      return { message: 'المستخدم موجود بالفعل', adminExists: true };
    }

    // إنشاء المستخدم في Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(adminEmail, adminPassword);
    const uid = userCredential.user.uid;

    // إنشاء المستخدم في Firestore
    const adminUser: User = {
      uid,
      email: adminEmail,
      displayName: 'سوبر أدمن النظام',
      phone: '01234567890',
      role: 'super_admin',
      createdAt: getEgyptTime(),
      lastLogin: getEgyptTime(),
      isActive: true,
    };

    await setDoc(doc(db, 'users', uid), adminUser);

    return { 
      message: 'تم إنشاء المستخدم بنجاح',
      email: adminEmail,
      password: adminPassword,
      uid,
    };
  } catch (error: any) {
    console.error('Create admin error:', error);
    throw new Error(error.message || 'فشل إنشاء المستخدم');
  }
};

// ============================================
// إنشاء مجموعات البيانات
// ============================================
const createCollections = async () => {
  const collections = ['users', 'academies', 'certificates', 'activities', 'searchLogs'];
  const results: any = {};

  for (const collectionName of collections) {
    try {
      // التحقق من وجود المجموعة
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      
      if (snapshot.empty) {
        // إنشاء مستند تمهيدي
        await setDoc(doc(db, collectionName, '_init'), {
          initialized: true,
          createdAt: getEgyptTime(),
        });
        results[collectionName] = 'تم الإنشاء';
      } else {
        results[collectionName] = 'موجودة بالفعل';
      }
    } catch (error: any) {
      results[collectionName] = `خطأ: ${error.message}`;
    }
  }

  return results;
};

// ============================================
// تعبئة بيانات تجريبية
// ============================================
const seedData = async () => {
  const results: any = {};

  // إنشاء أكاديمية تجريبية
  try {
    const academyData = {
      academyId: 'seed_academy_1',
      name: 'أكاديمية تكنولوجيا المعلومات التجريبية',
      taxNumber: '123-456-789',
      licenseNumber: 'NTI-SEED-001',
      branches: [
        {
          branchId: 'branch_1',
          governorate: 'القاهرة',
          address: 'ميدان التحرير - برج النيل - الدور الثالث',
          phone: '0223456789',
          isMainBranch: true,
        },
        {
          branchId: 'branch_2',
          governorate: 'الإسكندرية',
          address: 'شارع سعد زغلول - أمام الجامعة',
          phone: '0323456789',
          isMainBranch: false,
        },
      ],
      createdAt: getEgyptTime(),
      createdBy: 'system',
      updatedAt: getEgyptTime(),
      updatedBy: 'system',
      isDeleted: false,
    };

    await setDoc(doc(db, 'academies', 'seed_academy_1'), academyData);
    results.academy = 'تم إنشاء أكاديمية تجريبية';
  } catch (error: any) {
    results.academy = `خطأ: ${error.message}`;
  }

  // إنشاء شهادة تجريبية
  try {
    const certificateData = {
      certificateCode: 'NTI-CERT-SEED-001',
      studentName: 'أحمد محمد علي',
      courseName: 'أمن سيبراني متقدم',
      completionDate: getEgyptTime(),
      grade: 'A+',
      academyId: 'seed_academy_1',
      branchId: 'branch_1',
      academyName: 'أكاديمية تكنولوجيا المعلومات التجريبية',
      academyLicenseNumber: 'NTI-SEED-001',
      issuedBy: 'system',
      issuedAt: getEgyptTime(),
      updatedAt: getEgyptTime(),
      updatedBy: 'system',
      isActive: true,
    };

    await setDoc(doc(db, 'certificates', 'NTI-CERT-SEED-001'), certificateData);
    results.certificate = 'تم إنشاء شهادة تجريبية';
  } catch (error: any) {
    results.certificate = `خطأ: ${error.message}`;
  }

  return results;
};

// ============================================
// إعادة تعيين جميع البيانات
// ============================================
const resetAllData = async () => {
  const collections = ['academies', 'certificates', 'activities', 'searchLogs'];
  const results: any = {};

  for (const collectionName of collections) {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      results[collectionName] = 'تم الحذف';
    } catch (error: any) {
      results[collectionName] = `خطأ: ${error.message}`;
    }
  }

  return results;
};

// ============================================
// التحقق من حالة قاعدة البيانات
// ============================================
const checkStatus = async () => {
  const collections = ['users', 'academies', 'certificates', 'activities', 'searchLogs'];
  const results: any = {};

  for (const collectionName of collections) {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      results[collectionName] = {
        exists: !snapshot.empty,
        count: snapshot.size,
      };
    } catch (error: any) {
      results[collectionName] = {
        exists: false,
        error: error.message,
      };
    }
  }

  return results;
};

// ============================================
// GET: التحقق من حالة النظام
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // التحقق من صلاحية السوبر أدمن
    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: تحتاج صلاحية سوبر أدمن' },
        { status: 403 }
      );
    }

    const status = await checkStatus();

    return NextResponse.json({
      success: true,
      data: {
        status,
        firebase: {
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        },
        cloudinary: {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        },
        serverTime: getEgyptTime(),
        user: {
          uid: user.uid,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    console.error('GET /api/setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
