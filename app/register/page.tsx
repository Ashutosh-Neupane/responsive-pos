'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, useUIStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/hooks/use-translation';
import { Store, CheckCircle2, User, Mail, Lock, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';
import type { StoreCategory } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslation();
  const { language } = useUIStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    phone: '',
    category: 'general' as StoreCategory,
    tableMode: false,
    totalTables: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { setUser } = useAuthStore();

  const categories: { value: StoreCategory; label: string; labelNe: string }[] = [
    { value: 'grocery', label: 'Grocery Store', labelNe: 'किराना पसल' },
    { value: 'pharmacy', label: 'Pharmacy', labelNe: 'औषधि पसल' },
    { value: 'restaurant', label: 'Restaurant', labelNe: 'रेस्टुरेन्ट' },
    { value: 'retail', label: 'Retail Shop', labelNe: 'खुद्रा पसल' },
    { value: 'clothing', label: 'Clothing Store', labelNe: 'कपडा पसल' },
    { value: 'electronics', label: 'Electronics', labelNe: 'इलेक्ट्रोनिक्स' },
    { value: 'general', label: 'General Store', labelNe: 'सामान्य पसल' },
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.name || !formData.email || !formData.password || !formData.shopName) {
      setError(language === 'en' ? 'Please fill in all required fields' : 'सबै आवश्यक फिल्डहरू भर्नुहोस्');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'en' ? 'Passwords do not match' : 'पासवर्ड मेल खाएन');
      return;
    }

    if (formData.password.length < 6) {
      setError(language === 'en' ? 'Password must be at least 6 characters' : 'पासवर्ड कम्तिमा ६ अक्षर हुनुपर्छ');
      return;
    }

    setIsLoading(true);

    try {
      const { user, shop } = await authAPI.register(
        formData.email,
        formData.password,
        formData.name,
        formData.shopName,
        formData.phone,
        formData.category,
        language,
        formData.tableMode,
        formData.totalTables
      );
      setSuccess(true);
      setTimeout(() => {
        setUser(user, shop);
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === 'en' ? 'Registration failed' : 'दर्ता असफल भयो'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col relative overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white py-8 px-4 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{language === 'en' ? 'Sudha Nepali' : 'सुधा नेपाली'}</h1>
              <p className="text-blue-100 text-xs">{language === 'en' ? 'Modern POS System' : 'आधुनिक POS प्रणाली'}</p>
            </div>
          </div>
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Mobile Language Switcher */}
          <div className="md:hidden flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {/* Register Card */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl">
                {language === 'en' ? 'Create Your Account' : 'आफ्नो खाता बनाउनुहोस्'}
              </CardTitle>
              <p className="text-slate-600 text-sm">
                {language === 'en' ? 'Set up your shop and start managing your business' : 'आफ्नो पसल सेटअप गर्नुहोस् र व्यवसाय व्यवस्थापन सुरु गर्नुहोस्'}
              </p>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-slate-900">
                    {language === 'en' ? 'Account Created Successfully!' : 'खाता सफलतापूर्वक बनाइयो!'}
                  </h3>
                  <p className="text-slate-600">
                    {language === 'en' ? 'Redirecting to dashboard...' : 'ड्यासबोर्डमा रिडिरेक्ट गर्दै...'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        <User className="h-3 w-3 inline mr-1" />
                        {language === 'en' ? 'Full Name' : 'पूरा नाम'} *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={language === 'en' ? 'Your full name' : 'तपाईंको पूरा नाम'}
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        <Mail className="h-3 w-3 inline mr-1" />
                        {language === 'en' ? 'Email Address' : 'इमेल ठेगाना'} *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={language === 'en' ? 'your@email.com' : 'तपाईंको@इमेल.com'}
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shopName" className="text-sm font-medium">
                        <Building2 className="h-3 w-3 inline mr-1" />
                        {language === 'en' ? 'Shop Name' : 'पसलको नाम'} *
                      </Label>
                      <Input
                        id="shopName"
                        name="shopName"
                        type="text"
                        placeholder={language === 'en' ? 'Your shop name' : 'तपाईंको पसलको नाम'}
                        value={formData.shopName}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        <Phone className="h-3 w-3 inline mr-1" />
                        {language === 'en' ? 'Phone Number' : 'फोन नम्बर'}
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+977-9801234567"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="category" className="text-sm font-medium">
                        <Store className="h-3 w-3 inline mr-1" />
                        {language === 'en' ? 'Business Category' : 'व्यवसाय श्रेणी'} *
                      </Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as StoreCategory })}
                        disabled={isLoading}
                        required
                        className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {language === 'en' ? cat.label : cat.labelNe}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Restaurant Table Mode */}
                    {formData.category === 'restaurant' && (
                      <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="tableMode"
                            checked={formData.tableMode}
                            onChange={(e) => setFormData({ ...formData, tableMode: e.target.checked })}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <Label htmlFor="tableMode" className="text-sm font-medium text-orange-900 cursor-pointer">
                            {language === 'en' ? '🍽️ Enable Table Mode' : '🍽️ टेबल मोड सक्षम गर्नुहोस्'}
                          </Label>
                        </div>
                        {formData.tableMode && (
                          <div className="space-y-2">
                            <Label htmlFor="totalTables" className="text-sm font-medium text-orange-900">
                              {language === 'en' ? 'Total Number of Tables' : 'कुल टेबल संख्या'}
                            </Label>
                            <Input
                              id="totalTables"
                              type="number"
                              min="1"
                              max="100"
                              value={formData.totalTables}
                              onChange={(e) => setFormData({ ...formData, totalTables: parseInt(e.target.value) || 10 })}
                              className="h-10 bg-white"
                            />
                            <p className="text-xs text-orange-700">
                              {language === 'en' 
                                ? 'You can assign table numbers to orders in POS' 
                                : 'तपाईं POS मा अर्डरहरूमा टेबल नम्बर तोक्न सक्नुहुन्छ'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        <Lock className="h-3 w-3 inline mr-1" />
                        {language === 'en' ? 'Password' : 'पासवर्ड'} *
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder={language === 'en' ? 'At least 6 characters' : 'कम्तिमा ६ अक्षर'}
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        <Lock className="h-3 w-3 inline mr-1" />
                        {language === 'en' ? 'Confirm Password' : 'पासवर्ड पुष्टि गर्नुहोस्'} *
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder={language === 'en' ? 'Confirm your password' : 'तपाईंको पासवर्ड पुष्टि गर्नुहोस्'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700">
                    <p className="font-semibold text-blue-900 mb-2">
                      {language === 'en' ? '✨ What you get:' : '✨ तपाईंले के पाउनुहुन्छ:'}
                    </p>
                    <ul className="space-y-1 text-slate-600">
                      <li>• {language === 'en' ? 'Owner account with full access' : 'पूर्ण पहुँच भएको मालिक खाता'}</li>
                      <li>• {language === 'en' ? 'Auto-created cashier account' : 'स्वचालित रूपमा बनाइएको खजाँची खाता'}</li>
                      <li>• {language === 'en' ? 'Role-based permissions' : 'भूमिका-आधारित अनुमतिहरू'}</li>
                      <li>• {language === 'en' ? 'Multi-language support' : 'बहु-भाषा समर्थन'}</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? (language === 'en' ? 'Creating Account...' : 'खाता बनाउँदै...') 
                      : (language === 'en' ? 'Create Account' : 'खाता बनाउनुहोस्')}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-white text-slate-500 text-xs font-medium">
                        {language === 'en' ? 'Already have an account?' : 'पहिले नै खाता छ?'}
                      </span>
                    </div>
                  </div>

                  <Link href="/login">
                    <Button variant="outline" className="w-full h-10 border-slate-200 font-medium">
                      {language === 'en' ? 'Sign In' : 'साइन इन गर्नुहोस्'}
                    </Button>
                  </Link>
                </form>
              )}
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
