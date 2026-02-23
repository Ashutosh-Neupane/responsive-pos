'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Home,
  CreditCard,
  DollarSign,
  Globe,
  ChefHat,
  UtensilsCrossed,
  Receipt,
} from 'lucide-react';
import { LanguageSwitcher } from './language-switcher';

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', roles: ['owner', 'manager', 'cashier', 'staff'], categories: ['all'] },
  { href: '/dashboard/pos', icon: ShoppingCart, label: 'POS', roles: ['owner', 'manager', 'cashier', 'staff'], categories: ['all'] },
  { href: '/dashboard/kitchen', icon: UtensilsCrossed, label: 'Kitchen', roles: ['owner', 'manager', 'staff'], categories: ['restaurant'] },
  { href: '/dashboard/sales', icon: Receipt, label: 'Sales', roles: ['owner', 'manager'], categories: ['all'] },
  { href: '/dashboard/products', icon: Package, label: 'Products', roles: ['owner', 'manager'], categories: ['all'] },
  { href: '/dashboard/recipes', icon: ChefHat, label: 'Recipes', roles: ['owner', 'manager'], categories: ['restaurant'] },
  { href: '/dashboard/inventory', icon: BarChart3, label: 'Inventory', roles: ['owner', 'manager'], categories: ['all'] },
  { href: '/dashboard/customers', icon: Users, label: 'Customers', roles: ['owner', 'manager', 'cashier'], categories: ['all'] },
  { href: '/dashboard/khata', icon: CreditCard, label: 'Khata', roles: ['owner', 'manager', 'cashier'], categories: ['all'] },
  { href: '/dashboard/expenses', icon: DollarSign, label: 'Expenses', roles: ['owner', 'manager'], categories: ['all'] },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', roles: ['owner', 'manager'], categories: ['all'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, shop, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-slate-900 text-slate-100">
      {/* Logo */}
      <div className="border-b border-slate-700 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-blue-400" />
          <div>
            <p className="font-bold text-sm text-slate-100">Sudha Nepal</p>
            <p className="text-xs text-slate-400">Advance POS</p>
          </div>
        </div>
        {shop?.name && (
          <div className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
            {shop.name}
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {menuItems
          .filter((item) => {
            const hasRole = !user?.role || item.roles.includes(user.role);
            const hasCategory = item.categories.includes('all') || (shop?.category && item.categories.includes(shop.category));
            return hasRole && hasCategory;
          })
          .map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/dashboard' 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500 pl-3' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              </Link>
            );
          })}
      </nav>

      {/* User Info & Actions */}
      <div className="border-t border-slate-700 p-4 space-y-3">
        {/* Language Switcher */}
        <LanguageSwitcher variant="sidebar" />

        {/* User Info */}
        <div className="px-2 space-y-1">
          <p className="font-semibold text-slate-100 text-sm">{user?.name}</p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              user?.role === 'owner' ? 'bg-blue-600/20 text-blue-400' :
              user?.role === 'manager' ? 'bg-green-600/20 text-green-400' :
              user?.role === 'cashier' ? 'bg-purple-600/20 text-purple-400' :
              'bg-orange-600/20 text-orange-400'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-400 hover:bg-slate-800 hover:text-red-300 text-sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
