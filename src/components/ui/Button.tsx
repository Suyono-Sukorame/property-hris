import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white bg-[#0f766e] hover:bg-[#115e59] shadow-xs border border-transparent',
  secondary: 'text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs',
  ghost: 'text-slate-600 bg-transparent hover:bg-slate-100 border border-transparent',
  danger: 'text-rose-700 bg-white hover:bg-rose-50 border border-rose-200',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-[11px] gap-1',
  md: 'px-3.5 py-1.5 text-xs gap-1.5',
  lg: 'px-5 py-2.5 text-sm gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
