import React from 'react';

export type KPIColor = 'primary' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo';

interface KPICardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  sublabel?: React.ReactNode;
  icon?: React.ReactNode;
  color?: KPIColor;
  accentColor?: string; // Hex fallback or custom CSS color
  trend?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const colorBorderClasses: Record<KPIColor, string> = {
  primary: 'border-t-[#0f766e]',
  emerald: 'border-t-emerald-600',
  amber: 'border-t-amber-500',
  rose: 'border-t-rose-500',
  slate: 'border-t-slate-400',
  indigo: 'border-t-indigo-600',
};

const colorIconClasses: Record<KPIColor, string> = {
  primary: 'text-[#0f766e] bg-teal-50',
  emerald: 'text-emerald-700 bg-emerald-50',
  amber: 'text-amber-600 bg-amber-50',
  rose: 'text-rose-600 bg-rose-50',
  slate: 'text-slate-600 bg-slate-100',
  indigo: 'text-indigo-600 bg-indigo-50',
};

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  sublabel,
  icon,
  color = 'primary',
  accentColor,
  trend,
  footer,
  onClick,
  className = '',
}) => {
  const borderTopClass = colorBorderClasses[color] || 'border-t-[#0f766e]';
  const iconClass = colorIconClasses[color] || 'text-[#0f766e] bg-teal-50';

  return (
    <div
      onClick={onClick}
      className={`bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 border-t-2 ${borderTopClass} shadow-xs flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      } ${className}`}
      style={accentColor ? { borderTopColor: accentColor } : undefined}
    >
      <div>
        {/* Header Label & Icon */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
            {label}
          </span>
          {icon && (
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}
              style={accentColor ? { color: accentColor } : undefined}
            >
              {icon}
            </span>
          )}
        </div>

        {/* Value & Unit */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-2xl font-bold font-mono text-slate-900 tabular-nums leading-tight">
            {value}
          </span>
          {unit && (
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Sublabel / Trend / Footer */}
      {(sublabel || trend || footer) && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500">
          {sublabel && <div>{sublabel}</div>}
          {trend && <div>{trend}</div>}
          {footer && <div>{footer}</div>}
        </div>
      )}
    </div>
  );
};
