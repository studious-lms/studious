# 🌍 Studious Internationalization (i18n) Guide

## Overview

Studious now supports multiple languages using **next-intl**. The base infrastructure is fully set up and ready to use.

## 📁 Directory Structure

```
studious/
├── messages/                    # Translation files
│   ├── en.json                 # English (base)
│   ├── es.json                 # Spanish
│   ├── fr.json                 # French
│   └── zh.json                 # Chinese
├── src/
│   ├── i18n/
│   │   └── request.ts          # i18n configuration
│   └── components/
│       └── LanguageSwitcher.tsx # Language selector component
└── scripts/
    ├── translate.ts            # Auto-translation script
    └── README.md               # Translation script docs
```

## 🚀 Quick Start

### 1. Using Translations in Components

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <div>
      <button>{t('save')}</button>
      <button>{t('cancel')}</button>
    </div>
  );
}
```

### 2. Using Translations with Variables

```typescript
const t = useTranslations('home');

// In en.json: "welcomeBack": "Welcome back, {name}!"
<h1>{t('welcomeBack', { name: userName })}</h1>
```

### 3. Adding the Language Switcher

```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

## 📝 Translation File Structure

Translation files are organized by namespace:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "navigation": {
    "home": "Home",
    "classes": "Classes"
  },
  "auth": {
    "login": {
      "title": "Welcome Back",
      "subtitle": "Sign in to your account"
    }
  }
}
```

## 🤖 Automatic Translation

### Using the Translation Script

1. **Install OpenAI package (one-time):**
```bash
npm install openai
```

2. **Set up your API key:**
```bash
export OPENAI_API_KEY="sk-your-key-here"
```

3. **Translate all languages:**
```bash
npx ts-node scripts/translate.ts
```

4. **Translate specific language:**
```bash
npx ts-node scripts/translate.ts --lang=es
```

### Supported Languages

- ✅ English (en) - Base language
- ✅ Spanish (es) - Español  
- ✅ French (fr) - Français
- ✅ Chinese (zh) - 中文

**Can easily add:**
- German (de)
- Japanese (ja)
- Korean (ko)
- Portuguese (pt)
- Arabic (ar)

## 📦 Current Coverage

The base translation files include:

- ✅ **Common** - Save, Cancel, Delete, Edit, etc.
- ✅ **Navigation** - Home, Classes, Agenda, Chat, etc.
- ✅ **Authentication** - Login, Signup, Verification flows
- ✅ **Home/Dashboard** - Welcome messages, stats, assignments
- ✅ **Marketing** - Navbar, hero sections
- ✅ **Classes & Assignments** - Common labels
- ✅ **Time references** - Today, Tomorrow, This Week, etc.
- ✅ **Error messages** - Common error states

## 🎯 Next Steps

### Phase 1: Add Translation Support to Key Pages (Recommended)

1. **Login Page** (`src/app/(marketing)/login/page.tsx`)
   - Replace hardcoded strings with `t()` calls
   - Example: `t('auth.login.title')`

2. **Home Page** (`src/app/(software)/home/page.tsx`)
   - Use translations for dashboard labels
   - Example: `t('home.welcomeBack', { name })`

3. **Navigation** (`src/components/ui/primary-sidebar.tsx`)
   - Translate menu items
   - Example: `t('navigation.home')`

4. **Marketing Navbar** (`src/components/marketing/Navbar.tsx`)
   - Translate marketing content

### Phase 2: Expand Coverage

1. Add translations for modals
2. Translate form labels and validation messages
3. Add translations for class management pages
4. Translate assignment and grading interfaces

### Phase 3: Polish & Optimize

1. Have native speakers review translations
2. Add more language options based on user demand
3. Set up continuous translation workflow
4. Consider professional translation service integration

## 🛠️ Development Workflow

### Adding New Translation Keys

1. **Add to English file first:**
```json
// messages/en.json
{
  "myNewFeature": {
    "title": "My New Feature",
    "description": "This is a description"
  }
}
```

2. **Run auto-translation:**
```bash
npx ts-node scripts/translate.ts
```

3. **Review translations:**
   - Check `messages/es.json`, `messages/fr.json`, etc.
   - Make manual adjustments if needed

4. **Use in component:**
```typescript
const t = useTranslations('myNewFeature');
return <h1>{t('title')}</h1>;
```

## 🌐 User Language Selection

Users can change language via:
1. **LanguageSwitcher component** - Dropdown in navbar/settings
2. **Cookie persistence** - Language preference saved
3. **Automatic reload** - Page reloads with new language

## 📊 Story Points Estimate

### Already Completed (Base Setup): **~5 points**
- ✅ i18n infrastructure setup
- ✅ Base translation files (4 languages)
- ✅ Language switcher component
- ✅ Auto-translation script
- ✅ Documentation

### Remaining Work:

**Phase 1 - Key Pages (3-5 points):**
- Update Login page
- Update Home/Dashboard
- Update Navigation components
- Add LanguageSwitcher to UI

**Phase 2 - Full Coverage (8-13 points):**
- All modals and forms
- Class management pages
- Assignment interfaces
- Grading tools
- Settings pages

**Phase 3 - Polish (2-3 points):**
- Native speaker review
- Additional languages
- Translation memory setup

**Total Estimated:** 13-21 points for full implementation

## 💡 Tips & Best Practices

1. **Always use translation keys** - Never hardcode user-facing strings
2. **Group related translations** - Use namespaces like `auth`, `home`, etc.
3. **Keep keys descriptive** - `auth.login.title` > `login1`
4. **Review AI translations** - AI is 90% accurate, but review critical content
5. **Test in context** - Some translations work differently in UI
6. **Plan for expansion** - Text in other languages may be longer (German) or shorter (Chinese)

## 🔧 Troubleshooting

### Translations not showing?
- Check if messages file exists for the locale
- Verify the translation key exists in the JSON file
- Ensure NextIntlClientProvider wraps your app

### Language not persisting?
- Check cookie is being set correctly
- Verify cookie settings (path, maxAge)
- Clear browser cache if needed

### Build errors?
- Ensure all translation files have same structure
- Check for valid JSON syntax
- Verify next-intl plugin is in next.config.ts

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Translation Best Practices](https://developer.mozilla.org/en-US/docs/Web/Localizability)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

## 🎉 You're All Set!

The i18n infrastructure is ready to use. Start by adding translations to high-traffic pages, then expand from there. Happy translating! 🌍

