import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  trend?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  sublabel,
  icon,
  accentColor = '#0f766e',
  trend,
}) => {
  return (
    <div
      className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs border-t-2"
      style={{ borderTopColor: accentColor }}
    >
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
        {icon && <span style={{ color: accentColor }}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {sublabel && <div className="mt-2.5 text-[11px] text-slate-500">{sublabel}</div>}
      {trend && <div className="mt-2.5">{trend}</div>}
    </div>
  );
};
