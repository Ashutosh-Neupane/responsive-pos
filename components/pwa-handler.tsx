"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function PWAHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hasRedirected = localStorage.getItem("pwaRedirectDone");

    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    const urlParams = new URLSearchParams(window.location.search);
    const isPWAFromParams = urlParams.get("source") === "pwa";

    // Redirect ONLY the first time
    if (!hasRedirected && (isPWA || isPWAFromParams) && pathname === "/") {
      localStorage.setItem("pwaRedirectDone", "true");
      router.replace("/dashboard");
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      console.log("PWA install prompt available");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [router, pathname]);

  return null;
}
