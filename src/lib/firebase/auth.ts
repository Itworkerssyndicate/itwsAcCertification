import {
  auth,
  getEgyptTime,
} from './config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { User, UserRole } from '@/types';

// ============================================
// تسجيل الدخول
// ============================================
export const loginUser = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // جلب بيانات المستخدم من Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      return {
        success: false,
        error: 'المستخدم غير موجود في قاعدة البيانات',
      };
    }

    const userData = userDoc.data() as User;
    
    // تحديث آخر تسجيل دخول في Firestore
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      lastLogin: getEgyptTime(),
    });

    return {
      success: true,
      user: {
        ...userData,
        uid: firebaseUser.uid,
      },
    };
  } catch (error: any) {
    console.error('Login error:', error);
    let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'البريد الإلكتروني غير مسجل';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'كلمة المرور غير صحيحة';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'تم حظر الحساب مؤقتاً - حاول مرة أخرى لاحقاً';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'البريد الإلكتروني غير صحيح';
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ============================================
// تسجيل مستخدم جديد (للسوبر أدمن فقط)
// ============================================
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  phone: string,
  role: UserRole,
  createdBy: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // تحديث الاسم في Firebase Auth
    await updateProfile(firebaseUser, {
      displayName,
    });

    // إنشاء المستخدم في Firestore
    const userData: User = {
      uid: firebaseUser.uid,
      email,
      displayName,
      phone,
      role,
      createdAt: getEgyptTime(),
      lastLogin: getEgyptTime(),
      isActive: true,
      createdBy,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    return {
      success: true,
      user: userData,
    };
  } catch (error: any) {
    console.error('Register error:', error);
    let errorMessage = 'حدث خطأ أثناء التسجيل';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'كلمة المرور ضعيفة - يجب أن تكون 6 أحرف على الأقل';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'البريد الإلكتروني غير صحيح';
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ============================================
// تسجيل الخروج
// ============================================
export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تسجيل الخروج',
    };
  }
};

// ============================================
// إعادة تعيين كلمة المرور
// ============================================
export const resetPassword = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error('Reset password error:', error);
    let errorMessage = 'حدث خطأ أثناء إرسال رابط إعادة التعيين';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'البريد الإلكتروني غير مسجل';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'البريد الإلكتروني غير صحيح';
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ============================================
// الحصول على المستخدم الحالي من Firestore
// ============================================
export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();
      if (!firebaseUser) {
        resolve(null);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          resolve(null);
          return;
        }
        const userData = userDoc.data() as User;
        resolve({
          ...userData,
          uid: firebaseUser.uid,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};

// ============================================
// التحقق من صلاحية المستخدم من Firestore
// ============================================
export const checkUserPermission = async (
  userId: string,
  requiredRole: UserRole
): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return false;
    }
    const userData = userDoc.data() as User;
    
    if (requiredRole === 'super_admin') {
      return userData.role === 'super_admin';
    }
    if (requiredRole === 'admin') {
      return userData.role === 'admin' || userData.role === 'super_admin';
    }
    return true;
  } catch {
    return false;
  }
};

// ============================================
// تحديث بيانات المستخدم في Firestore
// ============================================
export const updateUser = async (
  userId: string,
  data: Partial<User>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: getEgyptTime(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Update user error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تحديث بيانات المستخدم',
    };
  }
};

// ============================================
// حذف مستخدم من Firestore (للسوبر أدمن فقط)
// ============================================
export const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // حذف من Firestore (Soft Delete)
    await updateDoc(doc(db, 'users', userId), {
      isActive: false,
      deletedAt: getEgyptTime(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete user error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء حذف المستخدم',
    };
  }
};
