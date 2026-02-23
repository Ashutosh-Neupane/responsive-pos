'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Don't show if dismissed or already installed
      if (!localStorage.getItem('pwa-prompt-dismissed') && !isInStandaloneMode) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For testing on localhost, show prompt after 2 seconds if not dismissed
    if (!isInStandaloneMode && !localStorage.getItem('pwa-prompt-dismissed')) {
      const timer = setTimeout(() => {
        if (!deferredPrompt) {
          setShowPrompt(true);
        }
      }, 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      alert('To install:\n\n1. Click browser menu (⋮)\n2. Select "Install app" or "Add to Home Screen"\n3. Follow the prompts');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-2xl p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold">SN</span>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Install Sudha POS</h3>
            <p className="text-sm text-blue-50 mb-3">
              Get app-like experience with offline access and faster performance
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              >
                <Download className="h-4 w-4 mr-1" />
                Install App
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
