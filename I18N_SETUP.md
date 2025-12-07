# Internationalization (i18n) Setup Guide

## Overview

The Home Crimes application now supports multiple languages using **next-intl**. Currently supports:
- 🇪🇸 **Spanish (es)** - Default language
- 🇬🇧 **English (en)**

## Features

✅ **Automatic locale detection** from cookies
✅ **Language switcher** component in header
✅ **All static content** translated
✅ **Easy to add** new languages
✅ **Server-side rendering** support
✅ **Type-safe** translations with TypeScript

## File Structure

```
messages/
├── en.json           # English translations
└── es.json           # Spanish translations

src/
├── i18n/
│   ├── config.ts     # Locale configuration
│   └── request.ts    # next-intl request configuration
├── components/
│   └── LanguageSwitcher.tsx  # Language switcher UI
└── middleware.ts     # Locale middleware
```

## How to Use

### In Components

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('sectionName');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Translation Files Structure

**messages/en.json:**
```json
{
  "sectionName": {
    "title": "My Title",
    "description": "My Description"
  }
}
```

**messages/es.json:**
```json
{
  "sectionName": {
    "title": "Mi Título",
    "description": "Mi Descripción"
  }
}
```

## Available Translation Sections

### 1. **hero** - Hero section
- `badge` - Mystery badge text
- `title` - Main title
- `titleHighlight` - Highlighted part of title
- `description` - Hero description
- `shopButton` - Shop button text
- `howItWorksButton` - How it works button
- `stats.casesSolved` - Cases solved label
- `stats.rating` - Rating label
- `stats.players` - Players label

### 2. **products** - Product showcase
- `title` - Section title
- `description` - Section description
- `bestseller` - Bestseller badge
- `difficulty` - Difficulty label
- `buyNow` - Buy button text

### 3. **howItWorks** - How it works section
- `title` - Section title
- `step1.title` - Step 1 title
- `step1.description` - Step 1 description
- `step2.title` - Step 2 title
- `step2.description` - Step 2 description
- `step3.title` - Step 3 title
- `step3.description` - Step 3 description

### 4. **testimonials** - Testimonials section
- `title` - Section title

### 5. **footer** - Footer section
- `description` - Brand description
- `quickLinks` - Quick links title
- `products` - Products link
- `howItWorks` - How it works link
- `accessGame` - Access game link
- `faq` - FAQ title
- `faqItems.access` - FAQ item
- `faqItems.included` - FAQ item
- `faqItems.shipping` - FAQ item
- `faqItems.return` - FAQ item
- `contact` - Contact title
- `copyright` - Copyright text

### 6. **header** - Header navigation
- `products` - Products link
- `howItWorks` - How it works link
- `accessGame` - Access game button

### 7. **gameAccess** - Game access page
- `title` - Page title
- `description` - Page description
- `codeLabel` - Code input label
- `codePlaceholder` - Code input placeholder
- `submitButton` - Submit button text
- `errorInvalidCode` - Error message
- `successMessage` - Success message
- `cantFindCode` - Can't find code title
- `cantFindCodeDescription` - Help text
- `demoCodes` - Demo codes title
- `demoCodesDescription` - Demo codes description

## Adding a New Language

### Step 1: Add locale to config

Edit `src/i18n/config.ts`:

```typescript
export const locales = ['en', 'es', 'fr'] as const; // Add 'fr'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français', // Add French
};
```

### Step 2: Create translation file

Create `messages/fr.json`:

```json
{
  "hero": {
    "badge": "🎭 Le Mystère Vous Attend",
    "title": "Résolvez des Crimes dans Votre",
    "titleHighlight": "Salon",
    ...
  },
  ...
}
```

### Step 3: Test

1. Restart dev server
2. Click language switcher
3. Select new language

## Language Switcher

The language switcher is automatically included in the header. It:
- Shows all available languages
- Highlights current language
- Persists selection in cookie
- Reloads page to apply changes

```tsx
<LanguageSwitcher />
```

## Changing Default Language

Edit `src/i18n/config.ts`:

```typescript
export const defaultLocale: Locale = 'en'; // Change to 'en' for English default
```

## Translation Best Practices

1. **Use nested keys** for organization
   ```json
   {
     "products": {
       "title": "Choose Your Mystery",
       "card": {
         "buyButton": "Buy Now"
       }
     }
   }
   ```

2. **Keep translations consistent** across languages

3. **Use interpolation** for dynamic values
   ```tsx
   t('welcome', { name: 'John' })
   ```
   ```json
   {
     "welcome": "Welcome, {name}!"
   }
   ```

4. **Use pluralization** when needed
   ```json
   {
     "items": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
   }
   ```

## Troubleshooting

### Translations not showing?

1. Check translation key exists in JSON file
2. Verify JSON is valid (no trailing commas)
3. Restart dev server
4. Check browser console for errors

### Language not switching?

1. Clear browser cookies
2. Check `NEXT_LOCALE` cookie is set
3. Verify locale is in `locales` array
4. Check middleware is working

### TypeScript errors?

1. Ensure all locales have same keys
2. Run type checking: `npm run build`
3. Check for typos in translation keys

## Advanced Usage

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('hero');
  
  return <h1>{t('title')}</h1>;
}
```

### Rich Text

```tsx
t.rich('description', {
  strong: (chunks) => <strong>{chunks}</strong>,
  br: () => <br />
})
```

### Date/Number Formatting

```tsx
import { useFormatter } from 'next-intl';

const format = useFormatter();

format.dateTime(new Date(), {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

format.number(1234.56, {
  style: 'currency',
  currency: 'USD'
});
```

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Translation Files](./messages/)
