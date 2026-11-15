import React from 'react';

interface FilterBarProps {
  children: React.ReactNode;
  summary?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  summary,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2.5 flex-wrap flex-1">
        {children}
      </div>

      {(summary || actions) && (
        <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
          {summary && (
            <div className="text-xs text-slate-500 font-medium">
              {summary}
            </div>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
