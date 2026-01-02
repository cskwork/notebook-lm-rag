import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  UI_LANGUAGE_STORAGE_KEY,
  mapApiErrorMessage,
  timeLocaleMap,
  translations,
  type Locale,
} from '../i18n';

type TranslationBundle = (typeof translations)[Locale];

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationBundle;
  timeLocale: string;
  mapApiError: (message: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const stored = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
  return stored === 'ko' ? 'ko' : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());

  useEffect(() => {
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const t = translations[locale];
  const timeLocale = timeLocaleMap[locale];

  const mapApiError = useCallback(
    (message: string) => mapApiErrorMessage(message, locale),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      timeLocale,
      mapApiError,
    }),
    [locale, setLocale, t, timeLocale, mapApiError]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}
