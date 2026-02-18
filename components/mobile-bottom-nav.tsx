'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  CreditCard,
  DollarSign,
  ChefHat,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const bottomNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home', roles: ['owner', 'manager', 'cashier', 'staff'], categories: ['all'] },
  { href: '/dashboard/pos', icon: ShoppingCart, label: 'POS', roles: ['owner', 'manager', 'cashier', 'staff'], categories: ['all'] },
  { href: '/dashboard/products', icon: Package, label: 'Products', roles: ['owner', 'manager'], categories: ['all'] },
  { href: '/dashboard/customers', icon: Users, label: 'Customers', roles: ['owner', 'manager', 'cashier'], categories: ['all'] },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, shop } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  const visibleItems = bottomNavItems.filter((item) => {
    const hasRole = !user?.role || item.roles.includes(user.role);
    const hasCategory = item.categories.includes('all') || (shop?.category && item.categories.includes(shop.category));
    return hasRole && hasCategory;
  });

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
        <div className={`grid h-16 ${visibleItems.length <= 4 ? `grid-cols-${visibleItems.length}` : 'grid-cols-5'}`}>
          {visibleItems.slice(0, visibleItems.length <= 4 ? 4 : 4).map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/dashboard' 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-600 active:bg-slate-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* More Menu - Only show if more than 4 items */}
          {visibleItems.length > 4 && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                showMenu ? 'text-blue-600 bg-blue-50' : 'text-slate-600 active:bg-slate-100'
              }`}
            >
              <Menu className={`h-5 w-5 ${showMenu ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs font-medium">More</span>
            </button>
          )}
        </div>
      </nav>

      {/* More Menu Overlay */}
      {showMenu && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 z-50 max-h-[60vh] overflow-y-auto">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">More Options</h3>
                <button onClick={() => setShowMenu(false)} className="text-slate-500">
                  ✕
                </button>
              </div>
              
              {/* Additional Menu Items */}
              <Link
                href="/dashboard/recipes"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 active:bg-slate-200"
              >
                <ChefHat className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium">Recipes</span>
              </Link>
              
              <Link
                href="/dashboard/inventory"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 active:bg-slate-200"
              >
                <BarChart3 className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium">Inventory</span>
              </Link>
              
              <Link
                href="/dashboard/khata"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 active:bg-slate-200"
              >
                <CreditCard className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium">Khata</span>
              </Link>
              
              <Link
                href="/dashboard/expenses"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 active:bg-slate-200"
              >
                <DollarSign className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium">Expenses</span>
              </Link>
              
              <Link
                href="/dashboard/analytics"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 active:bg-slate-200"
              >
                <BarChart3 className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium">Analytics</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
