import React, { forwardRef } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  hint?: string;
  error?: string;
  size?: 'sm' | 'md';
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      prefix,
      suffix,
      hint,
      error,
      size = 'md',
      className = '',
      containerClassName = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizeClasses = {
      sm: 'h-9 text-xs px-3',
      md: 'h-10 text-xs sm:text-sm px-3.5',
    };

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div
          className={`flex items-center rounded-xl bg-slate-50 border transition-all ${
            error
              ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-500'
              : 'border-slate-300 focus-within:ring-2 focus-within:ring-[#0f766e]/20 focus-within:border-[#0f766e]'
          } ${disabled ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''}`}
        >
          {prefix && (
            <span className="pl-3.5 pr-1.5 text-xs font-semibold text-slate-500 select-none shrink-0 font-mono">
              {prefix}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full bg-transparent font-mono text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-sans disabled:cursor-not-allowed ${sizeClasses[size]} ${
              prefix ? 'pl-0' : ''
            } ${suffix ? 'pr-0' : ''} ${className}`}
            {...props}
          />

          {suffix && (
            <span className="pr-3.5 pl-1.5 text-xs font-semibold text-slate-500 select-none shrink-0 font-mono">
              {suffix}
            </span>
          )}
        </div>

        {hint && !error && (
          <p className="text-[10px] text-slate-500 mt-0.5">{hint}</p>
        )}

        {error && (
          <p className="text-[10px] text-rose-500 font-medium mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
