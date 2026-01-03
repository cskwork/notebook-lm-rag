// 채팅 히스토리 컴포넌트
import { useState } from 'react';
import type { HistoryEntry } from '../types';
import { useLocale } from '../hooks';

interface ChatHistoryProps {
  history: HistoryEntry[];
  currentSessionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatHistory({
  history,
  currentSessionId,
  onSelect,
  onDelete,
}: ChatHistoryProps) {
  const { t, locale, timeLocale } = useLocale();
  const [isExpanded, setIsExpanded] = useState(true);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200">
      {/* 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <span>{t.chatHistory.title}</span>
        <ChevronIcon isExpanded={isExpanded} />
      </button>

      {/* 히스토리 목록 */}
      {isExpanded && (
        <div className="px-2 pb-2 space-y-1 max-h-64 overflow-y-auto">
          {history.map((entry) => (
            <HistoryItem
              key={entry.id}
              entry={entry}
              isActive={entry.id === currentSessionId}
              locale={locale}
              timeLocale={timeLocale}
              t={t}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface HistoryItemProps {
  entry: HistoryEntry;
  isActive: boolean;
  locale: string;
  timeLocale: string;
  t: ReturnType<typeof useLocale>['t'];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function HistoryItem({
  entry,
  isActive,
  locale,
  timeLocale,
  t,
  onSelect,
  onDelete,
}: HistoryItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(entry.id);
  };

  return (
    <div
      onClick={() => onSelect(entry.id)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={`
        relative px-3 py-2 rounded-lg cursor-pointer transition-colors
        ${isActive
          ? 'bg-primary-100 border border-primary-300'
          : 'hover:bg-gray-100 border border-transparent'
        }
      `}
    >
      {/* 노트북 이름 */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium truncate ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
          {entry.notebookName}
        </span>
        {showDelete && !isActive && (
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title={t.chatHistory.delete}
          >
            <DeleteIcon />
          </button>
        )}
      </div>

      {/* 마지막 메시지 미리보기 */}
      <p className="text-xs text-gray-500 truncate mt-0.5">
        {entry.lastMessagePreview || t.chatHistory.noMessages}
      </p>

      {/* Q&A 수 및 시간 */}
      <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
        <span>{t.chatHistory.qaCount.replace('{count}', String(entry.messageCount))}</span>
        <span>{formatRelativeTime(entry.lastUsedAt, locale, timeLocale)}</span>
      </div>
    </div>
  );
}

function formatRelativeTime(dateString: string, locale: string, timeLocale: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return locale === 'ko' ? '방금' : 'Just now';
  }
  if (diffMinutes < 60) {
    return locale === 'ko' ? `${diffMinutes}분 전` : `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return locale === 'ko' ? `${diffHours}시간 전` : `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return locale === 'ko' ? '어제' : 'Yesterday';
  }
  if (diffDays < 7) {
    return locale === 'ko' ? `${diffDays}일 전` : `${diffDays}d ago`;
  }

  return date.toLocaleDateString(timeLocale, { month: 'short', day: 'numeric' });
}

function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
