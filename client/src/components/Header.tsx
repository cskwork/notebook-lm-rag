// 앱 헤더 컴포넌트
import type { Session } from '../types';
import { useLocale } from '../hooks';

interface HeaderProps {
  session: Session | null;
}

export function Header({ session }: HeaderProps) {
  const { locale, setLocale, t } = useLocale();

  const statusLabel = session ? t.status[session.status] : t.status.none;

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">
          {t.appName}
        </h1>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        {session && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  session.status === 'active'
                    ? 'bg-green-500'
                    : session.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
                }`}
              />
              <span className="capitalize">{statusLabel}</span>
            </div>
            <div className="text-gray-400">|</div>
            <div>
              {t.header.sessionLabel}:{' '}
              <span className="font-medium text-gray-700">{session.id.slice(0, 8)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-gray-500">{t.header.languageLabel}</span>
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                locale === 'en'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={locale === 'en'}
            >
              {t.header.languageOptions.en}
            </button>
            <button
              type="button"
              onClick={() => setLocale('ko')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                locale === 'ko'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={locale === 'ko'}
            >
              {t.header.languageOptions.ko}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
