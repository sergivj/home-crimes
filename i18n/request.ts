import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    return {
      locale: defaultLocale,
      messages: (await import(`../../messages/${defaultLocale}.json`)).default,
    };
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
