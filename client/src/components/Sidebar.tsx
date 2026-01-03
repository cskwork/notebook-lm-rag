// 사이드바 컴포넌트 - 노트북 선택 및 세션 컨트롤
import type { Notebook, Session, HistoryEntry } from '../types';
import { useLocale } from '../hooks';
import { ChatHistory } from './ChatHistory';

interface SidebarProps {
  notebooks: Notebook[];
  selectedNotebook: Notebook | null;
  session: Session | null;
  isLoadingNotebooks: boolean;
  isCreatingSession: boolean;
  isGeneratingDoc: boolean;
  onSelectNotebook: (notebook: Notebook) => void;
  onCreateSession: () => void;
  onGenerateDoc: () => void;
  onDownloadDoc: () => void;
  onResetSession: () => void;
  chatHistory: HistoryEntry[];
  onLoadFromHistory: (id: string) => void;
  onDeleteFromHistory: (id: string) => void;
}

export function Sidebar({
  notebooks,
  selectedNotebook,
  session,
  isLoadingNotebooks,
  isCreatingSession,
  isGeneratingDoc,
  onSelectNotebook,
  onCreateSession,
  onGenerateDoc,
  onDownloadDoc,
  onResetSession,
  chatHistory,
  onLoadFromHistory,
  onDeleteFromHistory,
}: SidebarProps) {
  const { t } = useLocale();
  const messageCount = session?.messages.filter((m) => m.role === 'user').length ?? 0;
  const statusLabel = session ? t.status[session.status] : t.status.none;

  return (
    <aside className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* 채팅 히스토리 */}
      <ChatHistory
        history={chatHistory}
        currentSessionId={session?.id ?? null}
        onSelect={onLoadFromHistory}
        onDelete={onDeleteFromHistory}
      />

      {/* 노트북 선택 */}
      <div className="p-4 border-b border-gray-200">
        <label
          htmlFor="notebook-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t.sidebar.notebookLabel}
        </label>
        <select
          id="notebook-select"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={selectedNotebook?.id ?? ''}
          onChange={(e) => {
            const notebook = notebooks.find((n) => n.id === e.target.value);
            if (notebook) onSelectNotebook(notebook);
          }}
          disabled={isLoadingNotebooks || !!session}
        >
          <option value="">{t.sidebar.notebookPlaceholder}</option>
          {notebooks.map((notebook) => (
            <option key={notebook.id} value={notebook.id}>
              {notebook.name}
            </option>
          ))}
        </select>
        {isLoadingNotebooks && (
          <p className="mt-2 text-xs text-gray-500">{t.sidebar.loadingNotebooks}</p>
        )}
      </div>

      {/* 세션 정보 */}
      <div className="p-4 border-b border-gray-200 flex-1">
        <h3 className="text-sm font-medium text-gray-700 mb-4">{t.sidebar.sessionInfo}</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t.sidebar.qaCount}</span>
            <span className="text-sm font-semibold text-gray-900">{messageCount}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t.sidebar.statusLabel}</span>
            <span
              className={`text-sm font-semibold capitalize ${
                session?.status === 'active'
                  ? 'text-green-600'
                  : session?.status === 'error'
                  ? 'text-red-600'
                  : 'text-gray-400'
                }`}
            >
              {statusLabel}
            </span>
          </div>

          {session && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{t.sidebar.documentLabel}</span>
              <span
                className={`text-sm font-semibold ${
                  session.documentGenerated ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {session.documentGenerated
                  ? t.sidebar.documentReady
                  : t.sidebar.documentNotGenerated}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="p-4 space-y-3">
        {!session ? (
          <button
            onClick={onCreateSession}
            disabled={!selectedNotebook || isCreatingSession}
            className="w-full px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg
                       hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isCreatingSession ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                {t.sidebar.creating}
              </span>
            ) : (
              t.sidebar.startSession
            )}
          </button>
        ) : (
          <>
            <button
              onClick={onGenerateDoc}
              disabled={messageCount === 0 || isGeneratingDoc}
              className="w-full px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg
                         hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                         disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingDoc ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  {t.sidebar.generating}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <DocumentIcon />
                  {t.sidebar.generateReport}
                </span>
              )}
            </button>

            <button
              onClick={onDownloadDoc}
              disabled={!session.documentGenerated}
              className="w-full px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg
                         border border-gray-300 hover:bg-gray-50
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                         disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <DownloadIcon />
                {t.sidebar.downloadDocx}
              </span>
            </button>

            <button
              onClick={onResetSession}
              className="w-full px-4 py-2.5 bg-white text-red-600 text-sm font-medium rounded-lg
                         border border-red-300 hover:bg-red-50
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                         transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <ResetIcon />
                {t.sidebar.resetChat}
              </span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
