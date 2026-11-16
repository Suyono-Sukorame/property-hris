'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { captureAndCompressVideoFrame } from '@/lib/camera';

export interface UseCameraOptions {
  facingMode?: 'user' | 'environment';
  autoStart?: boolean;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { facingMode = 'user', autoStart = false } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsLoadingStream(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Kamera tidak didukung pada browser atau perangkat ini.');
      return;
    }

    setIsLoadingStream(true);
    setCameraError(null);

    // Stop existing stream if any
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsStreaming(true);
      setIsLoadingStream(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setIsLoadingStream(false);
      setIsStreaming(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Izin akses kamera ditolak. Silakan izinkan akses kamera di peramban Anda.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Kamera depan tidak ditemukan pada perangkat ini.');
      } else {
        setCameraError('Gagal membuka kamera: ' + (err.message || 'Kesalahan sistem'));
      }
    }
  }, [facingMode, stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return null;

    const compressed = captureAndCompressVideoFrame(videoRef.current, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.75,
    });

    if (compressed) {
      setCapturedImage(compressed);
      stopCamera();
    }

    return compressed;
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Ensure stream is bound to video element whenever it is rendered/mounted
  useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isStreaming]);

  // Clean up stream on unmount
  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [autoStart, startCamera, stopCamera]);

  return {
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
  };
}
