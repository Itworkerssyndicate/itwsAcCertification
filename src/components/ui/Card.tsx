'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ============================================
// واجهة خصائص البطاقة
// ============================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

// ============================================
// مكون البطاقة
// ============================================
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  animate = true,
  onClick,
}) => {
  // ============================================
  // أنماط البطاقة حسب النوع
  // ============================================
  const variantStyles = {
    default: 'bg-white dark:bg-dark-600 border border-gray-200 dark:border-gray-700',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
    gradient: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20',
    outline: 'bg-transparent border-2 border-primary-500',
  };

  // ============================================
  // أنماط الحشو
  // ============================================
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  // ============================================
  // تأثير التمرير
  // ============================================
  const hoverStyles = hover ? 'hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer' : '';

  // ============================================
  // الفئة النهائية
  // ============================================
  const cardClasses = `
    rounded-2xl shadow-lg
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${hoverStyles}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  // ============================================
  // تأثيرات الحركة
  // ============================================
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  } : {};

  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      {...motionProps}
      whileHover={hover ? { scale: 1.02, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } : {}}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// مكون رأس البطاقة
// ============================================
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  icon,
  title,
  subtitle,
}) => {
  return (
    <div className={`flex items-start gap-4 mb-4 ${className}`}>
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1">
        {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

// ============================================
// مكون محتوى البطاقة
// ============================================
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return <div className={`${className}`}>{children}</div>;
};

// ============================================
// مكون تذييل البطاقة
// ============================================
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  divider = true,
}) => {
  return (
    <div className={`
      mt-4 pt-4
      ${divider ? 'border-t border-gray-200 dark:border-gray-700' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

// ============================================
// مكون صورة البطاقة
// ============================================
interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  height?: string;
}

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  className = '',
  height = 'h-48',
}) => {
  return (
    <div className={`${height} w-full overflow-hidden rounded-t-2xl -m-6 mb-0`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

// ============================================
// مكونات البطاقة الإحصائية
// ============================================
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h4>
          {change && (
            <p className={`text-sm mt-1 ${change.type === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
              {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary-500/10 text-primary-500">
          {icon}
        </div>
      </div>
    </Card>
  );
};

// ============================================
// تصدير افتراضي
// ============================================
export default Card;
