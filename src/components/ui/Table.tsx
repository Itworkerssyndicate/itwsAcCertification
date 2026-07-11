'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import { Input } from './Input';

// ============================================
// واجهة خصائص الجدول
// ============================================
interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
}

// ============================================
// مكون الجدول
// ============================================
export function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'لا توجد بيانات',
  onRowClick,
  className = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  searchable = false,
  searchPlaceholder = 'بحث...',
  searchKeys = [],
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // ============================================
  // البحث
  // ============================================
  const filteredData = searchable && searchTerm
    ? data.filter((item) => {
        const keys = searchKeys.length > 0 ? searchKeys : (Object.keys(item) as (keyof T)[]);
        return keys.some((key) => {
          const value = item[key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      })
    : data;

  // ============================================
  // الترتيب
  // ============================================
  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortKey as keyof T];
        const bValue = b[sortKey as keyof T];
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }
        return 0;
      })
    : filteredData;

  // ============================================
  // التعامل مع الترتيب
  // ============================================
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // ============================================
  // محاذاة النص
  // ============================================
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // ============================================
  // حالة التحميل
  // ============================================
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // ============================================
  // حالة عدم وجود بيانات
  // ============================================
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* شريط البحث */}
      {searchable && (
        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1 max-w-sm">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {sortedData.length} نتيجة
          </div>
        </div>
      )}

      {/* الجدول */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
        <table className={`w-full ${tableClassName}`}>
          {/* رأس الجدول */}
          <thead className="bg-gray-50 dark:bg-dark-700">
            <tr className={headerClassName}>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`
                    px-4 py-3 text-xs font-semibold uppercase tracking-wider
                    ${alignStyles[column.align || 'left']}
                    ${column.width ? `min-w-[${column.width}]` : ''}
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortKey === column.key && (
                      <span className="text-primary-500">
                        {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* جسم الجدول */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-dark-600">
            {sortedData.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  hover:bg-gray-50 dark:hover:bg-dark-500 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${rowClassName}
                `}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`
                      px-4 py-3 text-sm text-gray-900 dark:text-gray-200
                      ${alignStyles[column.align || 'left']}
                      ${cellClassName}
                    `}
                  >
                    {column.render
                      ? column.render(item)
                      : item[column.key as keyof T] !== undefined && item[column.key as keyof T] !== null
                      ? String(item[column.key as keyof T])
                      : '-'}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// تصدير افتراضي
// ============================================
export default Table;
