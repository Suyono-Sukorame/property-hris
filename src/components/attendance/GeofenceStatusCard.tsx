'use client';

import React from 'react';
import {
  MapPin,
  Navigation,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { PropertySite } from '@/types/hris';
import { GeolocationCoordinates, GeolocationError } from '@/hooks/useGeolocation';
import { formatDistance, formatCoordinates } from '@/lib/geo';

export interface GeofenceStatusCardProps {
  targetSite: PropertySite;
  isSimulated: boolean;
  onToggleSimulated: (simulated: boolean) => void;
  coordinates: GeolocationCoordinates | null;
  distanceMeters: number;
  isWithinRadius: boolean;
  isLoadingGPS: boolean;
  gpsError: GeolocationError | null;
  onRefreshGPS: () => void;
  className?: string;
  showDemoToggle?: boolean;
  compact?: boolean;
}

export const GeofenceStatusCard: React.FC<GeofenceStatusCardProps> = ({
  targetSite,
  isSimulated,
  onToggleSimulated,
  coordinates,
  distanceMeters,
  isWithinRadius,
  isLoadingGPS,
  gpsError,
  onRefreshGPS,
  className = '',
  showDemoToggle = true,
  compact = true,
}) => {
  const allowedRadius = targetSite.geofenceRadiusMeters || 500;

  if (compact) {
    return (
      <div
        className={`rounded-xl border transition-all ${
          isSimulated || isWithinRadius
            ? 'bg-emerald-50/80 border-emerald-200'
            : 'bg-rose-50/80 border-rose-200'
        } p-2.5 sm:p-3 ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Sisi Kiri: Lokasi & Status */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                isSimulated || isWithinRadius
                  ? 'bg-emerald-100 border-emerald-300 text-[#0f766e]'
                  : 'bg-rose-100 border-rose-300 text-rose-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {targetSite.name}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded-full border border-emerald-200 inline-flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#0f766e]" />
                  {isSimulated ? 'Lokasi Sesuai (0m)' : isWithinRadius ? 'Dalam Radius' : 'Luar Radius'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {targetSite.category} · Radius max {allowedRadius}m
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Mini Toggle GPS / Demo (tanpa makan tempat) */}
          {showDemoToggle && (
            <button
              type="button"
              onClick={() => onToggleSimulated(!isSimulated)}
              title={isSimulated ? 'Beralih ke GPS Asli HP' : 'Beralih ke Simulasi 0m'}
              className="shrink-0 px-2 py-1 rounded-md text-[10px] font-medium bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#0f766e]" />
              <span className="hidden sm:inline">{isSimulated ? 'Simulasi' : 'GPS HP'}</span>
            </button>
          )}
        </div>

        {/* Error jika GPS gagal saat mode asli */}
        {!isSimulated && gpsError && (
          <div className="mt-2 pt-2 border-t border-rose-200/80 flex items-center justify-between text-[10px] text-rose-700">
            <span className="truncate">{gpsError.message}</span>
            <button
              type="button"
              onClick={() => onToggleSimulated(true)}
              className="underline font-bold shrink-0 ml-2 cursor-pointer"
            >
              Pakai Simulasi
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border transition-all ${
        isSimulated || isWithinRadius
          ? 'bg-emerald-50/70 border-emerald-200'
          : 'bg-rose-50/70 border-rose-200'
      } p-3 sm:p-3.5 space-y-2.5 ${className}`}
    >
      {/* ── HEADER ROW: SITE & STATUS PILL ───────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              isSimulated || isWithinRadius
                ? 'bg-emerald-100/80 border-emerald-300 text-[#0f766e]'
                : 'bg-rose-100/80 border-rose-300 text-rose-700'
            }`}
          >
            {isSimulated ? (
              <Compass className="w-4 h-4" />
            ) : (
              <Navigation
                className={`w-4 h-4 ${isLoadingGPS ? 'animate-spin' : ''}`}
              />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {targetSite.name}
            </h4>
            <p className="text-[10px] text-slate-500 truncate">
              Radius Maksimal: {allowedRadius}m · {targetSite.category}
            </p>
          </div>
        </div>

        {/* STATUS BADGE */}
        <div className="shrink-0">
          {isSimulated ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-[#065f46] border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-[#0f766e]" />
              Simulasi Valid
            </span>
          ) : isLoadingGPS ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-700">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              Mencari GPS...
            </span>
          ) : gpsError ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              GPS Error
            </span>
          ) : isWithinRadius ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-[#065f46] border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-[#0f766e]" />
              Dalam Radius
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 border border-rose-300">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              Luar Radius
            </span>
          )}
        </div>
      </div>

      {/* ── MODE SELECTOR (DEMO vs REAL GPS) ─────────────────────────── */}
      {showDemoToggle && (
        <div className="bg-white/80 p-1 rounded-lg border border-slate-200/80 flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => onToggleSimulated(false)}
            className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              !isSimulated
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>GPS Asli HP</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleSimulated(true)}
            className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              isSimulated
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Simulasi Proyek (0m)</span>
          </button>
        </div>
      )}

      {/* ── DETAILS PANEL ────────────────────────────────────────────── */}
      {isSimulated ? (
        /* MODE SIMULASI */
        <div className="bg-white/70 rounded-lg p-2.5 border border-emerald-200/60 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-slate-500">Jarak Terhitung:</span>
            <span className="font-mono font-bold text-emerald-800">
              0 meter (Tepat di Titik Gerbang)
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-slate-500">Koordinat Acuan:</span>
            <span className="font-mono text-slate-800">
              {formatCoordinates(targetSite.latitude, targetSite.longitude)}
            </span>
          </div>
          <p className="text-[10px] text-emerald-800 pt-1 border-t border-emerald-100 leading-relaxed">
            ✓ Mode simulasi aktif untuk kelancaran pengujian & demonstrasi tanpa harus berada di lokasi fisik proyek.
          </p>
        </div>
      ) : (
        /* MODE REAL GPS */
        <div className="bg-white/70 rounded-lg p-2.5 border border-slate-200/70 text-[11px] space-y-1.5">
          {isLoadingGPS ? (
            <div className="flex items-center gap-2 py-1 text-slate-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0f766e]" />
              <span>Menghubungi satelit GPS perangkat Anda...</span>
            </div>
          ) : gpsError ? (
            <div className="space-y-2">
              <div className="flex items-start gap-1.5 text-rose-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-tight text-[10px]">{gpsError.message}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-rose-100">
                <button
                  type="button"
                  onClick={onRefreshGPS}
                  className="px-2.5 py-1 text-[10px] font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Coba Deteksi Ulang
                </button>
                <button
                  type="button"
                  onClick={() => onToggleSimulated(true)}
                  className="px-2.5 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 rounded hover:bg-emerald-200 flex items-center gap-1 cursor-pointer"
                >
                  Gunakan Mode Simulasi
                </button>
              </div>
            </div>
          ) : coordinates ? (
            <>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Jarak Fisik ke Proyek:</span>
                <span
                  className={`font-mono font-bold ${
                    isWithinRadius ? 'text-emerald-800' : 'text-rose-700'
                  }`}
                >
                  {formatDistance(distanceMeters)} {isWithinRadius ? '(Aman)' : `(Melebihi ${allowedRadius}m)`}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Koordinat HP Anda:</span>
                <span className="font-mono text-slate-800">
                  {formatCoordinates(coordinates.latitude, coordinates.longitude)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Akurasi Perangkat:</span>
                <span className="text-slate-600 font-mono">
                  ±{coordinates.accuracy} meter
                </span>
              </div>

              {!isWithinRadius && (
                <div className="pt-1.5 border-t border-rose-100 text-[10px] text-rose-800 leading-relaxed">
                  <span className="font-semibold block">⚠️ Posisi Berada di Luar Radius Proyek</span>
                  Presensi ditolak jika berada di luar batas {allowedRadius} meter. Untuk keperluan demo/uji coba di luar lokasi, Bapak dapat beralih ke <strong>Simulasi Proyek</strong> di atas.
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Posisi GPS:</span>
              <button
                type="button"
                onClick={onRefreshGPS}
                className="text-[#0f766e] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <MapPin className="w-3 h-3" />
                Aktifkan GPS
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeofenceStatusCard;
