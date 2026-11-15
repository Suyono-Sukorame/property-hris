'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOSPromptOpen, setIsIOSPromptOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      // Safari iOS standalone check
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const active = isStandaloneMedia || isIOSStandalone;
      setIsStandalone(active);
      setIsInstalled(active);
    };

    checkStandalone();

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafariBrowser = /safari/.test(userAgent) && !/chrome|crios|fxios|edge|edg/.test(userAgent);
    setIsIOS(isAppleDevice && isSafariBrowser);

    // 3. Check dismissed flag from localStorage
    try {
      const dismissed = localStorage.getItem('property_hris_pwa_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // localStorage may fail in private mode
    }

    // 4. Capture beforeinstallprompt for Android Chrome / Chromium
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Detect app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsIOSPromptOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    // If iOS Safari, open iOS specific step-by-step guidance modal
    if (isIOS) {
      setIsIOSPromptOpen(true);
      return;
    }

    // If Android / Desktop Chromium with deferred prompt
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error('Error during PWA installation prompt:', err);
      }
    } else {
      // Fallback: If not iOS and no native prompt available (e.g. Chrome on iOS, or already prompt requested)
      setIsIOSPromptOpen(true);
    }
  }, [deferredPrompt, isIOS]);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem('property_hris_pwa_dismissed', 'true');
    } catch {
      // ignore
    }
  }, []);

  const resetDismiss = useCallback(() => {
    setIsDismissed(false);
    try {
      localStorage.removeItem('property_hris_pwa_dismissed');
    } catch {
      // ignore
    }
  }, []);

  return {
    isInstallable: !isInstalled && !isStandalone && (Boolean(deferredPrompt) || isIOS),
    isInstalled,
    isStandalone,
    isIOS,
    isIOSPromptOpen,
    isDismissed,
    openIOSPrompt: () => setIsIOSPromptOpen(true),
    closeIOSPrompt: () => setIsIOSPromptOpen(false),
    promptInstall,
    dismissBanner,
    resetDismiss,
  };
}
