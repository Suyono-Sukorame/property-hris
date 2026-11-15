'use client';

import React from 'react';
import { MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatDistance } from '@/lib/geo';

interface GeofenceBadgeProps {
  distanceMeters: number;
  verified: boolean;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export const GeofenceBadge: React.FC<GeofenceBadgeProps> = ({
  distanceMeters,
  verified,
  className = '',
  showIcon = true,
  compact = false,
}) => {
  const isZero = distanceMeters === 0;

  if (verified) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-md font-mono ${
          compact
            ? 'px-1.5 py-0.5 text-[10px]'
            : 'px-2 py-0.5 text-xs'
        } bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}
        title={`Geofence Terverifikasi (${formatDistance(distanceMeters)})`}
      >
        {showIcon && (
          isZero ? (
            <CheckCircle2 className="w-3 h-3 text-[#0f766e] shrink-0" />
          ) : (
            <MapPin className="w-3 h-3 text-[#0f766e] shrink-0" />
          )
        )}
        <span>
          {isZero ? '0m · Valid' : `${formatDistance(distanceMeters)} · Valid`}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md font-mono ${
        compact
          ? 'px-1.5 py-0.5 text-[10px]'
          : 'px-2 py-0.5 text-xs'
      } bg-rose-50 text-rose-800 border border-rose-200/80 ${className}`}
      title={`Di Luar Radius Geofence (${formatDistance(distanceMeters)})`}
    >
      {showIcon && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
      <span>{formatDistance(distanceMeters)} · Luar Radius</span>
    </span>
  );
};

export default GeofenceBadge;
