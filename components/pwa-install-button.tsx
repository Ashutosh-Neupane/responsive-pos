"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    // Check if dismissed
    const dismissed = localStorage.getItem("pwa-install-dismissed") === "true";
    setIsDismissed(dismissed);

    if (isInstalled || dismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("PWA install prompt captured");
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      console.log("PWA installed");
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // For testing: show button after 2 seconds if no prompt
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && !dismissed) {
        console.log("Showing install button (fallback)");
        setShowInstallButton(true);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback: show manual instructions
      alert(
        "To install this app:\n\n" +
        "On Chrome/Edge:\n" +
        "1. Click the menu (⋮)\n" +
        "2. Select 'Install app' or 'Add to Home Screen'\n\n" +
        "On Safari (iOS):\n" +
        "1. Tap the Share button\n" +
        "2. Select 'Add to Home Screen'"
      );
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("Install outcome:", outcome);

      if (outcome === "accepted") {
        setShowInstallButton(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Install error:", error);
    }
  };

  const handleClose = () => {
    setIsDismissed(true);
    setShowInstallButton(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showInstallButton || isDismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[9999] animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-2xl p-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white p-1"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold">SN</span>
          </div>
          
          <div className="flex-1 pr-6">
            <h3 className="font-bold text-lg mb-1">Install Sudha POS</h3>
            <p className="text-sm text-blue-50 mb-3">
              Get app-like experience with offline access
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              >
                <Download className="h-4 w-4 mr-1" />
                Install App
              </Button>
              <Button
                onClick={handleClose}
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
