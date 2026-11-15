import React from 'react';

export interface TabOption {
  id: string;
  label: string;
  count?: number;
  variant?: 'default' | 'amber' | 'rose' | 'emerald' | 'teal';
  icon?: React.ReactNode;
}

interface SegmentedTabsProps {
  options: TabOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

const badgeColorClasses: Record<string, string> = {
  default: 'bg-slate-200 text-slate-700',
  teal: 'bg-teal-100 text-[#0f766e]',
  emerald: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  rose: 'bg-rose-100 text-rose-800 font-bold',
};

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  options,
  activeId,
  onChange,
  className = '',
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <div
      className={`flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto shrink-0 ${className}`}
      role="tablist"
    >
      {options.map((opt) => {
        const isActive = activeId === opt.id;
        const badgeClass =
          badgeColorClasses[opt.variant || 'default'] || badgeColorClasses.default;

        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 select-none ${
              isSm ? 'px-2.5 py-1 text-[11px]' : 'px-3 sm:px-3.5 py-1.5 text-xs'
            } ${
              isActive
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] leading-tight ${badgeClass}`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
