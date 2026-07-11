// ============================================
// سكربت تعبئة البيانات التجريبية
// ============================================
// يستخدم لتعبئة قاعدة البيانات ببيانات تجريبية
// للتشغيل: node scripts/seed-data.js
// ============================================

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc 
} = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// ============================================
// تهيئة Firebase
// ============================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBfrK1IBCk2mim6cVbbtSd1e4FOQcpYQeo',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'itwsaccertification.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'itwsaccertification',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'itwsaccertification.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '521196512526',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:521196512526:web:b78b06dd87cf4f5ca1e35f',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================
// دوال مساعدة
// ============================================
const getEgyptTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
};

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateCertificateCode = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NTI-CERT-${year}-${random}`;
};

// ============================================
// المحافظات المصرية
// ============================================
const GOVERNORATES = [
  'القاهرة', 'الإسكندرية', 'الجيزة', 'القليوبية', 'الشرقية',
  'الدقهلية', 'المنوفية', 'الغربية', 'كفر الشيخ', 'دمياط',
  'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء',
  'البحر الأحمر', 'الأقصر', 'أسوان', 'أسيوط', 'سوهاج',
  'قنا', 'المنيا', 'بني سويف', 'الفيوم', 'مطروح', 'الوادي الجديد',
];

// ============================================
// التقديرات
// ============================================
const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-'];

// ============================================
// أسماء أكاديميات وهمية
// ============================================
const ACADEMY_NAMES = [
  'معهد القاهرة العالي لتكنولوجيا المعلومات',
  'أكاديمية النيل للتدريب التقني',
  'مركز التميز لتكنولوجيا المعلومات',
  'معهد الإسكندرية للبرمجيات',
  'أكاديمية المستقبل الرقمي',
  'مركز الجيزة للتدريب التقني',
  'معهد الدلتا للعلوم التكنولوجية',
  'أكاديمية الأهرام للبرمجيات',
  'مركز العاصمة للتدريب الرقمي',
  'معهد الجمهورية للتقنية',
];

// ============================================
// أسماء طلاب وهمية
// ============================================
const STUDENT_NAMES = [
  'أحمد محمد علي', 'محمد عبد الله', 'فاطمة أحمد', 'علي حسن',
  'نورة سعيد', 'خالد إبراهيم', 'سارة محمود', 'عمر خالد',
  'ليلى طارق', 'يوسف سليمان', 'منى رشاد', 'حسن عباس',
  'عائشة عبد الرحمن', 'محمود صلاح', 'ريم مصطفى', 'ياسر فتحي',
  'هند سمير', 'طارق ربيع', 'نادية عادل', 'عمرو شريف',
];

// ============================================
// أسماء دورات وهمية
// ============================================
const COURSE_NAMES = [
  'أمن سيبراني متقدم', 'تطوير تطبيقات الويب', 'الذكاء الاصطناعي',
  'علم البيانات', 'هندسة البرمجيات', 'إدارة المشاريع التقنية',
  'تطوير تطبيقات الموبايل', 'الحوسبة السحابية', 'بلوكتشين',
  'إنترنت الأشياء', 'تحليل البيانات الضخمة', 'التعلم الآلي',
  'أمن الشبكات', 'البرمجة الشيئية', 'قواعد البيانات المتقدمة',
];

// ============================================
// إنشاء مستخدم أدمن
// ============================================
const createAdminUser = async () => {
  console.log('📝 إنشاء مستخدم أدمن...');
  
  const adminEmail = 'superadmin@itws.com';
  const adminPassword = 'Admin@2026';

  try {
    // التحقق من وجود المستخدم
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', adminEmail));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log('✅ المستخدم موجود بالفعل');
      return;
    }

    // إنشاء المستخدم في Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const uid = userCredential.user.uid;

    // إنشاء المستخدم في Firestore
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: adminEmail,
      displayName: 'سوبر أدمن النظام',
      phone: '01234567890',
      role: 'super_admin',
      createdAt: getEgyptTime(),
      lastLogin: getEgyptTime(),
      isActive: true,
    });

    console.log(`✅ تم إنشاء المستخدم: ${adminEmail} / ${adminPassword}`);
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error.message);
  }
};

// ============================================
// إنشاء الأكاديميات
// ============================================
const createAcademies = async () => {
  console.log('🏛️ إنشاء الأكاديميات...');

  const academies = [];

  for (let i = 0; i < ACADEMY_NAMES.length; i++) {
    const academyId = generateId();
    const numBranches = Math.floor(Math.random() * 3) + 1;
    const branches = [];

    // اختيار محافظات عشوائية للفروع
    const shuffled = [...GOVERNORATES].sort(() => Math.random() - 0.5);
    const selectedGovernorates = shuffled.slice(0, numBranches);

    for (let j = 0; j < numBranches; j++) {
      branches.push({
        branchId: generateId(),
        governorate: selectedGovernorates[j],
        address: `شارع ${selectedGovernorates[j]} - مبنى ${Math.floor(Math.random() * 100) + 1}`,
        phone: `0${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        isMainBranch: j === 0,
      });
    }

    const academy = {
      academyId,
      name: ACADEMY_NAMES[i],
      taxNumber: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}`,
      licenseNumber: `NTI-${String(2024 + i)}-${String(i + 1).padStart(3, '0')}`,
      branches,
      createdAt: getEgyptTime(),
      createdBy: 'system',
      updatedAt: getEgyptTime(),
      updatedBy: 'system',
      isDeleted: false,
    };

    await setDoc(doc(db, 'academies', academyId), academy);
    academies.push(academy);
    console.log(`  ✅ ${academy.name}`);
  }

  return academies;
};

// ============================================
// إنشاء الشهادات
// ============================================
const createCertificates = async (academies) => {
  console.log('📜 إنشاء الشهادات...');

  const certificates = [];

  for (let i = 0; i < 50; i++) {
    const academy = academies[Math.floor(Math.random() * academies.length)];
    const branch = academy.branches[Math.floor(Math.random() * academy.branches.length)];
    const student = STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)];
    const course = COURSE_NAMES[Math.floor(Math.random() * COURSE_NAMES.length)];
    const grade = GRADES[Math.floor(Math.random() * GRADES.length)];

    const certificateCode = generateCertificateCode();
    const issuedAt = getEgyptTime();
    const completionDate = new Date(issuedAt);
    completionDate.setMonth(completionDate.getMonth() - Math.floor(Math.random() * 6));

    const certificate = {
      certificateCode,
      studentName: student,
      courseName: course,
      completionDate: completionDate,
      grade,
      academyId: academy.academyId,
      branchId: branch.branchId,
      academyName: academy.name,
      academyLicenseNumber: academy.licenseNumber,
      issuedBy: 'system',
      issuedAt: issuedAt,
      updatedAt: issuedAt,
      updatedBy: 'system',
      isActive: Math.random() > 0.1, // 90% نشطة
    };

    await setDoc(doc(db, 'certificates', certificateCode), certificate);
    certificates.push(certificate);
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ✅ ${i + 1} شهادة تم إنشاؤها`);
    }
  }

  console.log(`  ✅ إجمالي ${certificates.length} شهادة`);
  return certificates;
};

// ============================================
// تنظيف البيانات القديمة
// ============================================
const cleanData = async () => {
  console.log('🧹 تنظيف البيانات القديمة...');

  const collections = ['academies', 'certificates', 'activities', 'searchLogs'];

  for (const collectionName of collections) {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`  ✅ ${collectionName} تم تنظيفها`);
    } catch (error) {
      console.error(`  ❌ ${collectionName}:`, error.message);
    }
  }
};

// ============================================
// الدالة الرئيسية
// ============================================
const main = async () => {
  console.log('🚀 بدء تعبئة البيانات التجريبية...');
  console.log('========================================\n');

  try {
    // تنظيف البيانات القديمة
    await cleanData();

    // إنشاء المستخدم الأدمن
    await createAdminUser();

    // إنشاء الأكاديميات
    const academies = await createAcademies();

    // إنشاء الشهادات
    await createCertificates(academies);

    console.log('\n========================================');
    console.log('✅ تم تعبئة البيانات التجريبية بنجاح!');
    console.log(`📊 ${academies.length} أكاديمية`);
    console.log(`📜 50 شهادة`);
    console.log('👤 superadmin@itws.com / Admin@2026');
    console.log('========================================');
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    process.exit(1);
  }
};

// ============================================
// تشغيل السكربت
// ============================================
main();
