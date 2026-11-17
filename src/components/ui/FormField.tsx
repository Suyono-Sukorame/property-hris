import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-0.5 text-[10px] text-rose-500 font-medium">{error}</p>
      )}
    </div>
  );
};
