import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { enUS, es, fr, zhCN } from 'date-fns/locale';

// Map locale codes to date-fns locales
const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
  fr: fr,
  zh: zhCN,
};

/**
 * Get the date-fns locale object for a given locale code
 */
export function getDateLocale(locale: string): Locale {
  return localeMap[locale] || enUS;
}

/**
 * Format a date with locale support
 * @param date - Date to format
 * @param formatStr - Format string (date-fns format)
 * @param locale - Locale code (en, es, fr, zh)
 */
export function formatDate(date: Date | string, formatStr: string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: getDateLocale(locale) });
}

/**
 * Format a date relative to now with locale support
 * @param date - Date to format
 * @param locale - Locale code
 * @param options - Options for formatDistanceToNow
 */
export function formatRelativeDate(
  date: Date | string,
  locale: string = 'en',
  options?: { addSuffix?: boolean }
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, {
    locale: getDateLocale(locale),
    ...options,
  });
}

/**
 * Format a date with smart relative formatting
 * Returns "Today", "Tomorrow", "Yesterday", or formatted date
 * @param date - Date to format
 * @param locale - Locale code
 * @param t - Translation function for relative terms
 */
export function formatSmartDate(
  date: Date | string,
  locale: string = 'en',
  t?: (key: string) => string
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return t ? t('time.today') : 'Today';
  }
  if (isTomorrow(dateObj)) {
    return t ? t('time.tomorrow') : 'Tomorrow';
  }
  if (isYesterday(dateObj)) {
    return t ? t('time.yesterday') : 'Yesterday';
  }
  
  return format(dateObj, 'PPP', { locale: getDateLocale(locale) });
}

