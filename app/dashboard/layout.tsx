'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hydrated } = useAuthStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      return; // Wait for hydration
    }
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsReady(true);
    }
  }, [isAuthenticated, hydrated, router]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
