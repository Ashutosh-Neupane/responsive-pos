'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, useUIStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslation();
  const { language } = useUIStore();
  const [email, setEmail] = useState('owner@shudhanepali.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, shop } = await authAPI.login(email, password);
      setUser(user, shop);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col relative overflow-hidden">
      {/* Top Blue Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white py-12 px-4 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
              SN
            </div>
            <div>
              <h1 className="text-2xl font-bold">{language === 'en' ? 'Sudha Nepali' : 'सुधा नेपाली'}</h1>
              <p className="text-blue-100 text-sm">{language === 'en' ? 'Modern POS System' : 'आधुनिक POS प्रणाली'}</p>
            </div>
          </div>
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Mobile Language Switcher */}
          <div className="md:hidden flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="pt-8 pb-8 px-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('login')}</h2>
                <p className="text-slate-600 text-sm">
                  {language === 'en' 
                    ? 'Welcome back. Sign in to your account to continue.' 
                    : 'स्वागत छ। जारी रखन आफ्नो खाता मा साइन गर्नुहोस्।'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === 'en' ? 'name@example.com' : 'नाम@उदाहरण.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">{t('password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={language === 'en' ? 'Enter your password' : 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-10"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (language === 'en' ? 'Signing in...' : 'साइन इन हो रहेको छ...') : t('login')}
                </Button>
              </form>

              <div className="my-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-slate-500 text-xs font-medium">{language === 'en' ? 'New user?' : 'नयाँ प्रयोगकर्ता?'}</span>
                </div>
              </div>

              <Link href="/register">
                <Button 
                  variant="outline" 
                  className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-all"
                >
                  {t('signUp')}
                </Button>
              </Link>

              <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-lg text-xs text-slate-600 space-y-3">
                <p className="font-semibold text-slate-900">{language === 'en' ? '🎭 Demo Credentials - Role-Based Access' : '🎭 डेमो प्रमाणपत्र - भूमिका-आधारित पहुँच'}</p>
                <div className="space-y-3">
                  <div className="p-2 bg-white rounded border border-blue-100">
                    <p className="font-medium text-blue-900 mb-1">{language === 'en' ? '👑 Owner (Full Access)' : '👑 मालिक (पूर्ण पहुँच)'}:</p>
                    <p className="text-slate-600">Email: owner@shudhanepali.com</p>
                    <p className="text-slate-600">Password: password</p>
                    <p className="text-xs text-slate-500 mt-1">{language === 'en' ? 'All features & settings' : 'सबै सुविधाहरू र सेटिङहरू'}</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-green-100">
                    <p className="font-medium text-green-900 mb-1">{language === 'en' ? '💼 Manager' : '💼 प्रबन्धक'}:</p>
                    <p className="text-slate-600">Email: manager@shudhanepali.com</p>
                    <p className="text-slate-600">Password: password</p>
                    <p className="text-xs text-slate-500 mt-1">{language === 'en' ? 'Manage products, sales & reports' : 'उत्पादन, बिक्री र रिपोर्ट व्यवस्थापन'}</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-purple-100">
                    <p className="font-medium text-purple-900 mb-1">{language === 'en' ? '💰 Cashier (PIN: 1234)' : '💰 खजाँची (PIN: 1234)'}:</p>
                    <p className="text-slate-600">Email: cashier@shudhanepali.com</p>
                    <p className="text-slate-600">Password: password</p>
                    <p className="text-xs text-slate-500 mt-1">{language === 'en' ? 'POS & customer management' : 'POS र ग्राहक व्यवस्थापन'}</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-orange-100">
                    <p className="font-medium text-orange-900 mb-1">{language === 'en' ? '👤 Staff' : '👤 कर्मचारी'}:</p>
                    <p className="text-slate-600">Email: staff@shudhanepali.com</p>
                    <p className="text-slate-600">Password: password</p>
                    <p className="text-xs text-slate-500 mt-1">{language === 'en' ? 'Limited POS access' : 'सीमित POS पहुँच'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-500 mt-6">
            {language === 'en' 
              ? '© 2024 Sudha Nepali. All rights reserved.' 
              : '© 2024 सुधा नेपाली। सर्वाधिकार सुरक्षित।'}
          </p>
        </div>
      </div>
    </div>
  );
}
