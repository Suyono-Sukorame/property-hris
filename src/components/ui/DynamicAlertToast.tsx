'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, LogOut, CalendarCheck, X, Sparkles } from 'lucide-react';

export interface DynamicAlertData {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'LEAVE' | 'SUCCESS';
  title: string;
  subtitle: string;
  time?: string;
  meta?: string;
}

interface DynamicAlertToastProps {
  alert: DynamicAlertData | null;
  onDismiss: () => void;
  durationMs?: number;
}

export const DynamicAlertToast: React.FC<DynamicAlertToastProps> = ({
  alert,
  onDismiss,
  durationMs = 4000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!alert) return;

    setProgress(100);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [alert, durationMs, onDismiss]);

  if (!alert) return null;

  const isCheckIn = alert.type === 'CHECK_IN';
  const isCheckOut = alert.type === 'CHECK_OUT';
  const isLeave = alert.type === 'LEAVE';

  const borderClass = isCheckIn
    ? 'border-emerald-500/40 shadow-emerald-950/60'
    : isCheckOut
    ? 'border-amber-500/40 shadow-amber-950/60'
    : 'border-blue-500/40 shadow-blue-950/60';

  const iconBg = isCheckIn
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : isCheckOut
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

  const progressBarGradient = isCheckIn
    ? 'from-emerald-400 via-teal-300 to-emerald-500'
    : isCheckOut
    ? 'from-amber-400 via-orange-300 to-amber-500'
    : 'from-blue-400 via-indigo-300 to-blue-500';

  const badgeColor = isCheckIn
    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
    : isCheckOut
    ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
    : 'bg-blue-950/80 text-blue-300 border-blue-500/30';

  return (
    <aside
      aria-label="Notifikasi Presensi"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-sm sm:max-w-md select-none pointer-events-auto"
    >
      <div
        className={`relative bg-slate-900/95 backdrop-blur-xl border ${borderClass} rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-6 fade-in zoom-in-95 duration-250 ease-out`}
        role="status"
        aria-live="polite"
      >
        <div className="p-3.5 flex items-center gap-3">
          {/* Animated Glow Icon */}
          <div className="relative shrink-0">
            <span
              className={`absolute inset-0 rounded-xl animate-ping opacity-25 ${
                isCheckIn ? 'bg-emerald-400' : isCheckOut ? 'bg-amber-400' : 'bg-blue-400'
              }`}
            />
            <div
              className={`relative w-10 h-10 rounded-xl border ${iconBg} flex items-center justify-center shadow-inner`}
            >
              {isCheckIn ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isCheckOut ? (
                <LogOut className="w-5 h-5 text-amber-400" />
              ) : (
                <CalendarCheck className="w-5 h-5 text-blue-400" />
              )}
            </div>
          </div>

          {/* Text Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5 mb-0.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate flex items-center gap-1.5">
                <span>{alert.title}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 inline" />
              </h4>
              {alert.time && (
                <span
                  className={`font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeColor} shrink-0`}
                >
                  {alert.time}
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-300 truncate">
              {alert.subtitle}
            </p>

            {alert.meta && (
              <p
                className={`text-[10px] font-semibold mt-0.5 truncate ${
                  isCheckIn && alert.meta.includes('Terlambat')
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {alert.meta}
              </p>
            )}
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shrinking Progress Bar */}
        <div className="w-full h-1 bg-slate-800 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${progressBarGradient} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
