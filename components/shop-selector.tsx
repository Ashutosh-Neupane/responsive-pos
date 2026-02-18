'use client';

import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Store, Check } from 'lucide-react';

export function ShopSelector() {
  const { shop, shops, switchShop } = useAuthStore();

  if (!shop || shops.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          title="Switch Shop"
        >
          <Store className="h-4 w-4" />
          <span className="text-sm font-semibold">{shop.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {shops.map((s) => (
          <DropdownMenuItem
            key={s.id}
            onClick={() => switchShop(s.id)}
            className={`cursor-pointer flex items-center justify-between ${s.id === shop.id ? 'bg-accent' : ''}`}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{s.name}</span>
              <span className="text-xs text-slate-600">{s.category}</span>
            </div>
            {s.id === shop.id && <Check className="h-4 w-4 text-blue-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
