import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'hero';
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  icon,
  actions,
  variant = 'default',
  className = '',
}) => {
  if (variant === 'hero') {
    return (
      <div
        className={`bg-linear-to-r from-slate-900 via-slate-800 to-[#0f766e] text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
      >
        <div className="space-y-1">
          {badge && <div className="flex items-center gap-1.5">{badge}</div>}
          <div className="flex items-center gap-2">
            {icon && <span className="text-emerald-400 shrink-0">{icon}</span>}
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && <p className="text-xs text-slate-300">{subtitle}</p>}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="space-y-1">
        {badge && <div className="flex items-center gap-1.5">{badge}</div>}
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0f766e] flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
        </div>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
