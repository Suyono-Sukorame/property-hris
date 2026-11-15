import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  icon,
  ariaLabel,
  className = '',
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4 flex items-center justify-center">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={`w-full h-10 sm:h-9.5 ${
          icon ? 'pl-9' : 'pl-3'
        } pr-8 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] focus:bg-white cursor-pointer transition-all`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};
