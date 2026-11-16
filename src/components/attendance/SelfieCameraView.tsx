'use client';

import React, { useEffect, useState } from 'react';
import {
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { generateDemoAvatarPhoto } from '@/lib/camera';

interface SelfieCameraViewProps {
  onPhotoCaptured: (photoBase64: string | null) => void;
  employeeName?: string;
  employeeInitials?: string;
  avatarColor?: string;
  className?: string;
}

export const SelfieCameraView: React.FC<SelfieCameraViewProps> = ({
  onPhotoCaptured,
  employeeName = 'Karyawan',
  employeeInitials = 'KR',
  avatarColor = '#0f766e',
  className = '',
}) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const {
    videoRef,
    isStreaming,
    isLoadingStream,
    cameraError,
    capturedImage,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    setCapturedImage,
  } = useCamera({ facingMode: 'user', autoStart: false });

  // Handle switching to demo mode
  const handleEnableDemoMode = () => {
    stopCamera();
    setIsDemoMode(true);
    const demoPhoto = generateDemoAvatarPhoto(employeeInitials, employeeName, avatarColor);
    setCapturedImage(demoPhoto);
    onPhotoCaptured(demoPhoto);
  };

  // Handle switching to real camera
  const handleEnableRealCamera = () => {
    setIsDemoMode(false);
    setCapturedImage(null);
    onPhotoCaptured(null);
    startCamera();
  };

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      onPhotoCaptured(photo);
    }
  };

  const handleRetake = () => {
    onPhotoCaptured(null);
    retakePhoto();
  };

  // Automatically start camera on first mount if not demo
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5 ${className}`}>
      {/* ── HEADER ROW: TITLE & DEMO SWITCH ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-[#0f766e]">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 truncate">
            Verifikasi Foto Selfie
          </span>
        </div>

        {/* DEMO / REAL CAMERA TOGGLE */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[10px]">
          <button
            type="button"
            onClick={handleEnableRealCamera}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
              !isDemoMode
                ? 'bg-[#0f766e] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Kamera HP
          </button>
          <button
            type="button"
            onClick={handleEnableDemoMode}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              isDemoMode
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-2.5 h-2.5" />
            <span>Mode Demo</span>
          </button>
        </div>
      </div>

      {/* ── CAMERA / PREVIEW VIEWFINDER ──────────────────────────────────── */}
      <div className="relative w-full aspect-square max-w-52.5 sm:max-w-57.5 mx-auto rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 shadow-inner flex items-center justify-center">
        {isDemoMode && capturedImage ? (
          /* PREVIEW MODE DEMO */
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Demo Avatar Presensi"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-2xs p-2 text-center text-white">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Mode Demo Aktif
              </span>
              <p className="text-[9px] text-slate-300 truncate">
                Disimulasikan valid untuk pengujian
              </p>
            </div>
          </div>
        ) : capturedImage ? (
          /* PREVIEW HASIL JEPRET KAMERA ASLI */
          <div className="relative w-full h-full animate-in fade-in duration-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Foto Selfie Presensi"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>Foto Siap</span>
            </div>
          </div>
        ) : cameraError ? (
          /* ERROR STATE (Kamera ditolak / tidak ditemukan) */
          <div className="p-3 text-center space-y-2">
            <AlertCircle className="w-7 h-7 text-rose-400 mx-auto" />
            <p className="text-[11px] text-rose-200 leading-tight">
              {cameraError}
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                type="button"
                onClick={startCamera}
                className="px-2 py-1 text-[10px] font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Coba Lagi</span>
              </button>
              <button
                type="button"
                onClick={handleEnableDemoMode}
                className="px-2 py-1 text-[10px] font-bold text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Pakai Mode Demo</span>
              </button>
            </div>
          </div>
        ) : (
          /* LIVE CAMERA FEED */
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                isLoadingStream ? 'opacity-0' : 'opacity-100'
              } transition-opacity duration-300`}
            />

            {isLoadingStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-300">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-[10px] font-medium">Membuka kamera depan...</span>
              </div>
            )}

            {/* OVAL FACE GUIDE OVERLAY */}
            {!isLoadingStream && isStreaming && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-3">
                <div className="w-35 sm:w-37.5 h-43.75 sm:h-47.5 rounded-[50%] border-2 border-dashed border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse" />
                <span className="text-[9px] font-semibold text-white/90 bg-slate-950/70 px-2 py-0.5 rounded-full mt-2 tracking-wide">
                  Posisikan Wajah di Sini
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER CONTROLS ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 pt-0.5">
        {isDemoMode ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0f766e]" />
              Foto Terverifikasi (Mode Demo)
            </span>
          </div>
        ) : capturedImage ? (
          <button
            type="button"
            onClick={handleRetake}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Foto Ulang</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCapture}
            disabled={!isStreaming || isLoadingStream}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span>Ambil Foto Selfie</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SelfieCameraView;
