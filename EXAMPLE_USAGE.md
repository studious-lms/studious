# 📖 Translation Usage Examples

Quick reference for using translations in your Studious components.

## Basic Usage

### Client Component
```typescript
'use client';
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

### Server Component
```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyServerComponent() {
  const t = await getTranslations('common');
  
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

## Real Examples from Your Codebase

### Example 1: Login Page

**Before:**
```typescript
<h1 className="text-2xl font-bold">Welcome Back</h1>
<p className="text-sm text-muted">Sign in to your Studious account</p>
```

**After:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Login() {
  const t = useTranslations('auth.login');
  
  return (
    <>
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-muted">{t('subtitle')}</p>
    </>
  );
}
```

### Example 2: Navigation Sidebar

**Before:**
```typescript
const navigationItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/classes", label: "Classes", icon: BookOpen },
  { href: "/agenda", label: "Agenda", icon: Calendar },
];
```

**After:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export function PrimarySidebar() {
  const t = useTranslations('navigation');
  
  const navigationItems = [
    { href: "/home", label: t('home'), icon: Home },
    { href: "/classes", label: t('classes'), icon: BookOpen },
    { href: "/agenda", label: t('agenda'), icon: Calendar },
  ];
  
  return (
    // ... rest of component
  );
}
```

### Example 3: Home Page with Variables

**Before:**
```typescript
<h1>Welcome back, {appState.user.displayName}!</h1>
<p>Here's what's happening with your classes today.</p>
```

**After:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');
  const userName = appState.user.displayName || appState.user.username;
  
  return (
    <>
      <h1>{t('welcomeBack', { name: userName })}</h1>
      <p>{t('subtitle')}</p>
    </>
  );
}
```

### Example 4: Navbar with Marketing Content

**Before:**
```typescript
<Link href="/pricing">Pricing</Link>
<Link href="/program">School Program</Link>
<Button onClick={() => setShowEarlyAccess(true)}>
  Request Early Access
</Button>
```

**After:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export function Navbar() {
  const tNav = useTranslations('navigation');
  const tMarketing = useTranslations('marketing.navbar');
  
  return (
    <>
      <Link href="/pricing">{tNav('pricing')}</Link>
      <Link href="/program">{tNav('schoolProgram')}</Link>
      <Button onClick={() => setShowEarlyAccess(true)}>
        {tMarketing('requestEarlyAccess')}
      </Button>
    </>
  );
}
```

### Example 5: Forms with Multiple Namespaces

**Before:**
```typescript
<label>Username</label>
<Input placeholder="Enter your username" />
<Button type="submit">Sign in</Button>
```

**After:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export function LoginForm() {
  const t = useTranslations('auth.login');
  
  return (
    <>
      <label>{t('username')}</label>
      <Input placeholder={t('username')} />
      <Button type="submit">{t('signIn')}</Button>
    </>
  );
}
```

### Example 6: Conditional Messages

**Before:**
```typescript
{isToday(date) ? "Due today" : 
 isTomorrow(date) ? "Due tomorrow" : 
 `Due ${format(date, 'MMM d')}`}
```

**After:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export function DueDate({ date }: { date: Date }) {
  const t = useTranslations('home.upcomingAssignments');
  
  if (isToday(date)) return t('dueToday');
  if (isTomorrow(date)) return t('dueTomorrow');
  return t('due', { date: format(date, 'MMM d') });
}
```

### Example 7: Toast Messages

**Before:**
```typescript
toast.success('Successfully logged in');
toast.error('Failed to send verification email');
```

**After:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export function Login() {
  const t = useTranslations('auth.login');
  
  const handleLogin = () => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success(t('successMessage'));
      }
    });
  };
}
```

## Adding the Language Switcher

### In Navbar
```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Navbar() {
  return (
    <nav>
      <div className="flex items-center gap-4">
        <Logo />
        <NavLinks />
        <LanguageSwitcher /> {/* Add here */}
        <UserMenu />
      </div>
    </nav>
  );
}
```

### In Settings Page
```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function SettingsPage() {
  const t = useTranslations('settings');
  
  return (
    <div>
      <h2>{t('language')}</h2>
      <LanguageSwitcher />
    </div>
  );
}
```

### In User Dropdown Menu
```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function UserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2">
          <LanguageSwitcher />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Testing Different Languages

### In Development
```typescript
// Force a specific language for testing
import { setCookie } from 'cookies-next';

setCookie('NEXT_LOCALE', 'es'); // Spanish
setCookie('NEXT_LOCALE', 'fr'); // French
setCookie('NEXT_LOCALE', 'zh'); // Chinese
window.location.reload();
```

### In Browser Console
```javascript
// Quick test different languages
document.cookie = "NEXT_LOCALE=es; path=/";
location.reload();
```

## Common Patterns

### Loading States
```typescript
const t = useTranslations('common');

{isLoading ? t('loading') : t('submit')}
```

### Empty States
```typescript
const t = useTranslations('common');

{items.length === 0 && <p>{t('noData')}</p>}
```

### Confirmation Dialogs
```typescript
const t = useTranslations('common');

<AlertDialog>
  <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
  <AlertDialogAction>{t('delete')}</AlertDialogAction>
</AlertDialog>
```

## Tips for Migration

1. **Start with high-traffic pages** (login, home, navigation)
2. **Search for hardcoded strings**: `grep -r "Welcome" src/`
3. **Group related translations** in the JSON files
4. **Use variables** for dynamic content
5. **Test in multiple languages** as you go

## Need Help?

- Check `TRANSLATION_GUIDE.md` for complete documentation
- See translation files in `messages/` for available keys
- Run `npx ts-node scripts/translate.ts` to add new languages

