'use client';

import { useUIStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'sidebar';
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useUIStore();

  if (variant === 'sidebar') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition-all text-sm"
            title={language === 'en' ? 'English' : 'नेपाली'}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="font-semibold">{language === 'en' ? 'English' : 'नेपाली'}</span>
            </div>
            <span className="text-xs">({language.toUpperCase()})</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            onClick={() => setLanguage('en')}
            className={language === 'en' ? 'bg-blue-100' : ''}
          >
            <span>English</span>
            {language === 'en' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLanguage('ne')}
            className={language === 'ne' ? 'bg-blue-100' : ''}
          >
            <span>नेपाली</span>
            {language === 'ne' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all"
          title={language === 'en' ? 'English' : 'नेपाली'}
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold">{language.toUpperCase()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          <span>English</span>
          {language === 'en' && <span className="ml-2">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('ne')}
          className={language === 'ne' ? 'bg-accent' : ''}
        >
          <span>नेपाली</span>
          {language === 'ne' && <span className="ml-2">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
