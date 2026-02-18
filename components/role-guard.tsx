'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

const pageRoles: Record<string, string[]> = {
  '/dashboard': ['owner', 'manager', 'cashier', 'staff'],
  '/dashboard/pos': ['owner', 'manager', 'cashier', 'staff'],
  '/dashboard/products': ['owner', 'manager'],
  '/dashboard/recipes': ['owner', 'manager'],
  '/dashboard/inventory': ['owner', 'manager'],
  '/dashboard/customers': ['owner', 'manager', 'cashier'],
  '/dashboard/khata': ['owner', 'manager', 'cashier'],
  '/dashboard/expenses': ['owner', 'manager'],
  '/dashboard/analytics': ['owner', 'manager'],
};

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && pathname) {
      const allowedRoles = pageRoles[pathname];
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to dashboard if not authorized
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, pathname, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const allowedRoles = pageRoles[pathname || ''];
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
