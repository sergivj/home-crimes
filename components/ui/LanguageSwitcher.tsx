
"use client";

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
// import { Button } from '@/components/ui/button';
import { locales, localeNames } from '@/i18n/config';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => (
        <div
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className={`uppercase text-xs border rounded-md p-2 cursor-pointer hover:bg-black hover:text-white transition ${
            locale === currentLocale ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          {locale}
        </div>
      ))}
    </div>
  );
}
