"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.matchMedia("(display-mode: standalone)").matches;
    }
    return false;
  });
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pwa-install-dismissed") === "true";
    }
    return false;
  });
  const pathname = usePathname();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const isDashboardPage = pathname?.startsWith("/dashboard");

  if (!showInstallButton || isDismissed || !isDashboardPage) return null;

  return (
    <div className="fixed top-5 right-5 z-[1000] bg-white p-3 rounded-md shadow-lg border border-blue-600 max-w-[250px]">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-slate-900 flex-1">
          Install Sudha POS App
        </p>
        <button
          onClick={handleClose}
          className="text-slate-500 hover:text-slate-700 ml-2"
        >
          <X size={14} />
        </button>
      </div>
      <Button
        size="sm"
        onClick={handleInstallClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Download className="h-4 w-4 mr-1" />
        Install App
      </Button>
    </div>
  );
}
