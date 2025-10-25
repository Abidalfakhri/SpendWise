import React from 'react';

const variants = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  outline: 'border border-slate-700 hover:bg-slate-800 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-5 py-2.5 text-lg',
};

const base =
  'inline-flex items-center justify-center rounded transition focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed';

export default function Button({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) {
  const widthClass = fullWidth ? 'w-full' : '';
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}