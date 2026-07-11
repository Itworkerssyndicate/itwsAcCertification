'use client';

import { useState, useEffect, useCallback } from 'react';
import { ActivityLog, ActivityType } from '@/types';
import { getActivities, getActivitiesByUser, logActivity } from '@/lib/firebase/firestore';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

// ============================================
// واجهة هوك سجل النشاطات
// ============================================
interface UseActivityLogReturn {
  activities: ActivityLog[];
  loading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  fetchUserActivities: (userId: string) => Promise<void>;
  addActivity: (data: Omit<ActivityLog, 'activityId' | 'timestamp'>) => Promise<boolean>;
  clearActivities: () => void;
  filterByType: (type: ActivityType) => ActivityLog[];
  filterByUser: (userId: string) => ActivityLog[];
  filterByDate: (startDate: Date, endDate: Date) => ActivityLog[];
  getRecentActivities: (limit: number) => ActivityLog[];
  getActivityStats: () => {
    total: number;
    byType: Record<ActivityType, number>;
    byUser: Record<string, number>;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

// ============================================
// هوك سجل النشاطات
// ============================================
export const useActivityLog = (): UseActivityLogReturn => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // ============================================
  // جلب جميع النشاطات
  // ============================================
  const fetchActivities = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActivities();
      setActivities(data);
    } catch (err: any) {
      console.error('Fetch activities error:', err);
      setError(err.message || 'حدث خطأ أثناء جلب سجل النشاطات');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // جلب نشاطات مستخدم معين
  // ============================================
  const fetchUserActivities = useCallback(async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActivitiesByUser(userId);
      setActivities(data);
    } catch (err: any) {
      console.error('Fetch user activities error:', err);
      setError(err.message || 'حدث خطأ أثناء جلب نشاطات المستخدم');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // إضافة نشاط جديد
  // ============================================
  const addActivity = useCallback(async (
    data: Omit<ActivityLog, 'activityId' | 'timestamp'>
  ): Promise<boolean> => {
    try {
      const result = await logActivity(data);
      if (result.success) {
        // تحديث القائمة المحلية
        await fetchActivities();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Add activity error:', err);
      toast.error('حدث خطأ أثناء تسجيل النشاط');
      return false;
    }
  }, [fetchActivities]);

  // ============================================
  // مسح النشاطات
  // ============================================
  const clearActivities = useCallback((): void => {
    setActivities([]);
  }, []);

  // ============================================
  // فلترة حسب النوع
  // ============================================
  const filterByType = useCallback((type: ActivityType): ActivityLog[] => {
    return activities.filter(activity => activity.type === type);
  }, [activities]);

  // ============================================
  // فلترة حسب المستخدم
  // ============================================
  const filterByUser = useCallback((userId: string): ActivityLog[] => {
    return activities.filter(activity => activity.userId === userId);
  }, [activities]);

  // ============================================
  // فلترة حسب التاريخ
  // ============================================
  const filterByDate = useCallback((startDate: Date, endDate: Date): ActivityLog[] => {
    return activities.filter(activity => {
      const timestamp = activity.timestamp instanceof Date ? activity.timestamp : new Date(activity.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    });
  }, [activities]);

  // ============================================
  // الحصول على أحدث النشاطات
  // ============================================
  const getRecentActivities = useCallback((limit: number): ActivityLog[] => {
    const sorted = [...activities].sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    return sorted.slice(0, limit);
  }, [activities]);

  // ============================================
  // الحصول على إحصائيات النشاطات
  // ============================================
  const getActivityStats = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const byType: Record<ActivityType, number> = {} as Record<ActivityType, number>;
    const byUser: Record<string, number> = {};
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    activities.forEach(activity => {
      // حسب النوع
      byType[activity.type] = (byType[activity.type] || 0) + 1;

      // حسب المستخدم
      byUser[activity.userId] = (byUser[activity.userId] || 0) + 1;

      // حسب التاريخ
      const timestamp = activity.timestamp instanceof Date ? activity.timestamp : new Date(activity.timestamp);
      
      if (timestamp >= today) {
        todayCount++;
      }
      if (timestamp >= weekStart) {
        weekCount++;
      }
      if (timestamp >= monthStart) {
        monthCount++;
      }
    });

    return {
      total: activities.length,
      byType,
      byUser,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
    };
  }, [activities]);

  // ============================================
  // تحميل النشاطات عند بدء التشغيل
  // ============================================
  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, fetchActivities]);

  // ============================================
  // القيم المصدرة
  // ============================================
  return {
    activities,
    loading,
    error,
    fetchActivities,
    fetchUserActivities,
    addActivity,
    clearActivities,
    filterByType,
    filterByUser,
    filterByDate,
    getRecentActivities,
    getActivityStats,
  };
};

// ============================================
// تصدير افتراضي
// ============================================
export default useActivityLog;
