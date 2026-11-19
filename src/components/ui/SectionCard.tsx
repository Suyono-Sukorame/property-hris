import React from 'react';

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon,
  action,
  badge,
  footer,
  children,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {icon && <span className="shrink-0">{icon}</span>}
              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                {title}
              </h3>
              {badge && <span className="shrink-0">{badge}</span>}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        <div className={`mt-3.5 ${bodyClassName}`}>{children}</div>
      </div>

      {footer && <div className="pt-3 border-t border-slate-100">{footer}</div>}
    </div>
  );
};
