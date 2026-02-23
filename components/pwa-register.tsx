'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker on both HTTP (localhost) and HTTPS
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '[::1]';
      
      const isHTTPS = window.location.protocol === 'https:';
      
      if (isLocalhost || isHTTPS) {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('✅ Service Worker registered successfully:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🔄 New version available! Refresh to update.');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.log('❌ Service Worker registration failed:', error);
          });
      }
    }
  }, []);

  return null;
}
