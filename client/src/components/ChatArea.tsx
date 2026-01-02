// 채팅 영역 컴포넌트
import { useEffect, useRef, useState } from 'react';
import type { Message } from '../types';
import { useLocale } from '../hooks';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  hasSession: boolean;
}

export function ChatArea({ messages, isLoading, hasSession }: ChatAreaProps) {
  const { t, timeLocale } = useLocale();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!hasSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t.chat.startTitle}
          </h3>
          <p className="text-sm text-gray-500">
            {t.chat.startDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto py-6 px-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">
              {t.chat.sessionStarted}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                timeLocale={timeLocale}
                labels={{
                  assistant: t.chat.assistant,
                  sources: t.chat.sources,
                  queryDetails: t.chat.queryDetails,
                }}
              />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="mt-6">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

// 쿼리 메타데이터 접기/펼치기 컴포넌트
function ThinkingSection({ thinking, label }: { thinking: string; label: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-2 border-b border-gray-200 pb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>{label}</span>
      </button>
      {isExpanded && (
        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 overflow-x-auto max-h-48 overflow-y-auto">
          {thinking}
        </pre>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  timeLocale,
  labels,
}: {
  message: Message;
  timeLocale: string;
  labels: { assistant: string; sources: string; queryDetails: string };
}) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-primary-600 text-white rounded-2xl rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md'
        } px-4 py-3`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
            <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-500">{labels.assistant}</span>
          </div>
        )}

        {/* 쿼리 메타데이터 (접힌 상태) */}
        {!isUser && message.thinking && (
          <ThinkingSection thinking={message.thinking} label={labels.queryDetails} />
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">{labels.sources}:</p>
            <div className="space-y-1">
              {message.sources.map((source, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 bg-white/50 rounded px-2 py-1"
                >
                  {source.title}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`text-xs mt-2 ${isUser ? 'text-primary-200' : 'text-gray-400'}`}
        >
          {formatTime(message.timestamp, timeLocale)}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp: string, timeLocale: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(timeLocale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
