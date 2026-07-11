// ============================================
// أنواع المستخدمين
// ============================================
export type UserRole = 'admin' | 'super_admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone: string;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
  createdBy?: string;
  updatedAt?: Date;
  deletedAt?: Date;
  sessionId?: string;
}

// ============================================
// أنواع الأكاديميات
// ============================================
export interface AcademyBranch {
  branchId: string;
  governorate: string;
  address: string;
  phone: string;
  isMainBranch: boolean;
}

export interface Academy {
  academyId: string;
  name: string;
  taxNumber: string;
  licenseNumber: string;
  branches: AcademyBranch[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deletionReason?: string;
}

// ============================================
// أنواع الشهادات
// ============================================
export interface Certificate {
  certificateCode: string;
  studentName: string;
  courseName: string;
  completionDate: Date;
  grade: string;
  academyId: string;
  branchId: string;
  academyName: string;
  academyLicenseNumber: string;
  issuedBy: string;
  issuedAt: Date;
  updatedAt: Date;
  updatedBy: string;
  isActive: boolean;
  pdfUrl?: string;
  qrCode?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

// ============================================
// أنواع سجل النشاطات
// ============================================
export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'create_academy' 
  | 'update_academy' 
  | 'delete_academy'
  | 'create_certificate' 
  | 'update_certificate' 
  | 'delete_certificate'
  | 'search_certificate'
  | 'search_academy'
  | 'generate_report'
  | 'export_pdf'
  | 'export_excel'
  | 'upload_logo'
  | 'upload_stamp'
  | 'user_create'
  | 'user_update'
  | 'user_delete'
  | 'view_activities'
  | 'view_reports';

export interface ActivityLog {
  activityId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  type: ActivityType;
  description: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// ============================================
// أنواع سجل البحث
// ============================================
export interface SearchLog {
  searchId: string;
  searchType: 'certificate' | 'academy';
  searchValue: string;
  searcherName: string;
  searcherPhone: string;
  searcherEntity: string;
  searcherEntityType: string;
  governorate: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  resultCount: number;
}

// ============================================
// أنواع التقارير
// ============================================
export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  academyId?: string;
  governorate?: string;
  searchType?: string;
  userId?: string;
  activityType?: ActivityType;
}

export interface ReportData {
  title: string;
  generatedAt: Date;
  generatedBy: string;
  committeeName: string;
  unionName: string;
  data: any[];
  summary: {
    total: number;
    [key: string]: any;
  };
}

// ============================================
// أنواع إعدادات النظام
// ============================================
export interface SystemSettings {
  logoUrl: string;
  stampUrl: string;
  unionName: string;
  committeeName: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  maintenanceMode: boolean;
  lastUpdated: Date;
  updatedBy: string;
}

// ============================================
// أنواع دوال المصادقة
// ============================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  phone: string;
  role: UserRole;
  adminCode?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

// ============================================
// أنواع البحث
// ============================================
export interface SearchRequest {
  searchType: 'certificate' | 'academy';
  value: string;
  searcherName: string;
  searcherPhone: string;
  searcherEntity: string;
  searcherEntityType: string;
  governorate: string;
}

export interface SearchResponse {
  success: boolean;
  results: any[];
  count: number;
  searchId: string;
}

// ============================================
// أنواع الإحصائيات
// ============================================
export interface DashboardStats {
  totalCertificates: number;
  totalAcademies: number;
  totalUsers: number;
  totalSearches: number;
  certificatesThisMonth: number;
  academiesThisMonth: number;
  recentActivities: ActivityLog[];
  recentSearches: SearchLog[];
  certificateByGrade: Record<string, number>;
  certificateByAcademy: Record<string, number>;
  searchByGovernorate: Record<string, number>;
}

// ============================================
// أنواع الاستجابة من API
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// أنواع معالجة الملفات
// ============================================
export interface FileUploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  secureUrl?: string;
  error?: string;
}

// ============================================
// أنواع التصدير
// ============================================
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeLogo?: boolean;
  includeStamp?: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'letter';
}
