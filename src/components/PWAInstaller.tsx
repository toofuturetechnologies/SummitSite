/**
 * PWA Install Prompt Component
 * Shows "Install on home screen" prompt for mobile users
 */

'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('✅ Service Worker registered:', reg);
        })
        .catch((err) => {
          console.error('❌ Service Worker registration failed:', err);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Only show on mobile devices
      if (window.innerWidth < 768) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ App installed');
      setShowPrompt(false);
      setInstallPrompt(null);
    } else {
      console.log('❌ Installation cancelled');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg p-4 z-50 md:bottom-6 md:right-6 md:left-auto md:max-w-sm">
      <div className="flex gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
            <Download className="h-5 w-5" />
            Install Summit
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Add to your home screen for easy access and offline support
          </p>
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors text-sm w-full"
          >
            Install Now
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
