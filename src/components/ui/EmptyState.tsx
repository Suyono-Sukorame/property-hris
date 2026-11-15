import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  variant?: 'card' | 'table' | 'inline';
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  colSpan?: number;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'card',
  title,
  message = 'Tidak ada data yang sesuai dengan filter atau pencarian.',
  icon,
  action,
  colSpan = 1,
  className = '',
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-10">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      {title && (
        <h4 className="text-sm font-bold text-slate-700 mb-1">
          {title}
        </h4>
      )}
      <p className="text-xs text-slate-500 max-w-sm">
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );

  if (variant === 'table') {
    return (
      <tr>
        <td colSpan={colSpan} className={`px-4 py-8 ${className}`}>
          {content}
        </td>
      </tr>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`p-4 text-center text-xs text-slate-400 ${className}`}>
        {message}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs ${className}`}>
      {content}
    </div>
  );
};
