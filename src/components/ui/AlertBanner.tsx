import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

type AlertType = 'success' | 'warning' | 'info';

interface AlertBannerProps {
  type?: AlertType;
  title: string;
  message?: string;
}

const alertStyles: Record<AlertType, { wrapper: string; icon: React.ReactNode }> = {
  success: {
    wrapper: 'p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800',
    icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
  },
  warning: {
    wrapper: 'p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800',
    icon: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
  },
  info: {
    wrapper: 'p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800',
    icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'success',
  title,
  message,
}) => {
  const styles = alertStyles[type];

  return (
    <div className={`${styles.wrapper} flex items-center gap-3 text-xs`}>
      {styles.icon}
      <div>
        <strong className="font-bold block">{title}</strong>
        {message && <p className="text-[11px] opacity-80 mt-0.5">{message}</p>}
      </div>
    </div>
  );
};
