'use client';

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

// ============================================
// واجهة خصائص الإدخال
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

// ============================================
// مكون الإدخال
// ============================================
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  icon: Icon,
  iconPosition = 'left',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  type = 'text',
  disabled,
  required,
  placeholder,
  value,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // ============================================
  // تحديد نوع الإدخال (للتعامل مع كلمة المرور)
  // ============================================
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // ============================================
  // أنماط الحاوية
  // ============================================
  const containerClasses = `
    relative flex flex-col gap-1.5 w-full
    ${containerClassName}
  `;

  // ============================================
  // أنماط التسمية
  // ============================================
  const labelClasses = `
    text-sm font-medium text-gray-700 dark:text-gray-300
    ${error ? 'text-red-500 dark:text-red-400' : ''}
    ${labelClassName}
  `;

  // ============================================
  // أنماط الحقل
  // ============================================
  const inputClasses = `
    w-full px-4 py-2.5 rounded-xl
    bg-white dark:bg-dark-600
    border-2 transition-all duration-200
    text-gray-900 dark:text-white
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    focus:outline-none focus:ring-2 focus:ring-primary-500/20
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${success ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : ''}
    ${!error && !success ? 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-primary-500' : ''}
    ${Icon && iconPosition === 'left' ? 'pl-12' : ''}
    ${Icon && iconPosition === 'right' ? 'pr-12' : ''}
    ${type === 'password' ? 'pr-12' : ''}
    ${inputClassName}
  `;

  // ============================================
  // أنماط رسالة الخطأ
  // ============================================
  const errorClasses = `
    text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5
    ${errorClassName}
  `;

  // ============================================
  // أيقونة كلمة المرور
  // ============================================
  const PasswordToggleIcon = type === 'password' ? (showPassword ? EyeOff : Eye) : null;

  // ============================================
  // أيقونة الحالة
  // ============================================
  const StatusIcon = error ? AlertCircle : success ? CheckCircle : null;
  const statusColor = error ? 'text-red-500' : success ? 'text-green-500' : '';

  return (
    <div className={containerClasses}>
      {/* التسمية */}
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* حقل الإدخال */}
      <div className="relative">
        {/* الأيقونة اليسرى */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon size={20} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          {...props}
        />

        {/* الأيقونة اليمنى */}
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon size={20} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* أيقونة الحالة */}
        {StatusIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <StatusIcon size={20} className={statusColor} />
          </div>
        )}

        {/* زر إظهار/إخفاء كلمة المرور */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {PasswordToggleIcon && <PasswordToggleIcon size={20} />}
          </button>
        )}
      </div>

      {/* رسالة الخطأ */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={errorClasses}
          >
            <AlertCircle size={16} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

// ============================================
// تصدير افتراضي
// ============================================
export default Input;
