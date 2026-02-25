import React from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Card({ className, style, children, isDarkMode = false }) {
  return (
    <div
      className={cx(
        'rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl',
        !style && (isDarkMode ? 'bg-gray-800 border-gray-700 shadow-lg' : 'bg-white border-gray-200 shadow-md hover:shadow-2xl'),
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cx('p-4', className)}>{children}</div>;
}

export function CardTitle({ className, children, isDarkMode = false }) {
  return (
    <div
      className={cx(
        'text-base font-semibold',
        isDarkMode ? 'text-white' : 'text-gray-900',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children }) {
  return <div className={cx('p-4 pt-0', className)}>{children}</div>;
}
