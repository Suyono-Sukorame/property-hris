'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoRequest?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 30000,
    autoRequest = true,
  } = options;

  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permissionState, setPermissionState] = useState<PermissionState | 'unknown'>('unknown');

  // Check browser support and permission state on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setIsSupported(false);
      setError({
        code: 0,
        message: 'Perangkat atau browser ini tidak mendukung sensor GPS Geolocation.',
      });
      return;
    }

    setIsSupported(true);

    if ('permissions' in navigator && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          setPermissionState(status.state);
          status.onchange = () => {
            setPermissionState(status.state);
          };
        })
        .catch(() => {
          setPermissionState('unknown');
        });
    }
  }, []);

  const requestPosition = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setIsSupported(false);
      setError({
        code: 0,
        message: 'Perangkat atau browser ini tidak mendukung sensor GPS Geolocation.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: position.timestamp,
        });
        setIsLoading(false);
        setPermissionState('granted');
      },
      (geoError) => {
        setIsLoading(false);
        let userFriendlyMsg = 'Gagal mendeteksi lokasi GPS.';

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            userFriendlyMsg =
              'Izin lokasi GPS ditolak oleh browser/perangkat. Aktifkan izin lokasi pada pengaturan browser Anda.';
            setPermissionState('denied');
            break;
          case geoError.POSITION_UNAVAILABLE:
            userFriendlyMsg =
              'Sinyal GPS tidak tersedia atau perangkat tidak dapat menentukan posisi.';
            break;
          case geoError.TIMEOUT:
            userFriendlyMsg =
              'Waktu pencarian koordinat GPS habis (timeout). Silakan coba lagi.';
            break;
        }

        setError({
          code: geoError.code,
          message: userFriendlyMsg,
        });
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    if (autoRequest && isSupported) {
      requestPosition();
    }
  }, [autoRequest, isSupported, requestPosition]);

  return {
    coordinates,
    error,
    isLoading,
    isSupported,
    permissionState,
    refreshPosition: requestPosition,
  };
}
