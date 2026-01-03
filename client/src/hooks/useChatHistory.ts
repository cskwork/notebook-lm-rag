// 채팅 히스토리 관리 훅
import { useState, useCallback, useEffect } from 'react';
import type { Session, Notebook, HistoryEntry, HistoryStoredSession } from '../types';

const HISTORY_LIST_KEY = 'chat-history-list';
const HISTORY_SESSION_PREFIX = 'chat-history-session-';
const MAX_HISTORY_ENTRIES = 10;

interface UseChatHistoryReturn {
  history: HistoryEntry[];
  saveSession: (session: Session, notebook: Notebook) => void;
  loadSession: (id: string) => HistoryStoredSession | null;
  deleteSession: (id: string) => void;
  updateLastUsed: (id: string) => void;
}

function getSessionStorageKey(id: string): string {
  return `${HISTORY_SESSION_PREFIX}${id}`;
}

function sortByLastUsed(entries: HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort((a, b) =>
    new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
  );
}

function getLastUserMessage(session: Session): string {
  const userMessages = session.messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return '';
  const lastMessage = userMessages[userMessages.length - 1].content;
  return lastMessage.length > 50 ? lastMessage.slice(0, 50) + '...' : lastMessage;
}

export function useChatHistory(): UseChatHistoryReturn {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // localStorage에서 히스토리 목록 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_LIST_KEY);
      if (stored) {
        const entries = JSON.parse(stored) as HistoryEntry[];
        setHistory(sortByLastUsed(entries));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, []);

  // 히스토리 목록 저장
  const saveHistoryList = useCallback((entries: HistoryEntry[]) => {
    try {
      localStorage.setItem(HISTORY_LIST_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save history list:', error);
    }
  }, []);

  // 세션 저장 (신규 또는 업데이트)
  const saveSession = useCallback((session: Session, notebook: Notebook) => {
    const now = new Date().toISOString();
    const userMessageCount = session.messages.filter(m => m.role === 'user').length;

    // 메시지가 없으면 저장하지 않음
    if (userMessageCount === 0) return;

    setHistory(prevHistory => {
      const existingIndex = prevHistory.findIndex(h => h.id === session.id);

      const entry: HistoryEntry = {
        id: session.id,
        notebookId: notebook.id,
        notebookName: notebook.name,
        messageCount: userMessageCount,
        lastMessagePreview: getLastUserMessage(session),
        createdAt: existingIndex >= 0 ? prevHistory[existingIndex].createdAt : now,
        lastUsedAt: now,
      };

      let newHistory: HistoryEntry[];

      if (existingIndex >= 0) {
        // 기존 엔트리 업데이트
        newHistory = [...prevHistory];
        newHistory[existingIndex] = entry;
      } else {
        // 새 엔트리 추가
        newHistory = [entry, ...prevHistory];

        // 최대 개수 초과 시 가장 오래된 것 제거
        if (newHistory.length > MAX_HISTORY_ENTRIES) {
          const sorted = sortByLastUsed(newHistory);
          const removed = sorted.pop();
          if (removed) {
            localStorage.removeItem(getSessionStorageKey(removed.id));
          }
          newHistory = sorted;
        }
      }

      const sorted = sortByLastUsed(newHistory);
      saveHistoryList(sorted);

      // 전체 세션 데이터 저장
      try {
        const storedSession: HistoryStoredSession = { session, selectedNotebook: notebook };
        localStorage.setItem(getSessionStorageKey(session.id), JSON.stringify(storedSession));
      } catch (error) {
        console.error('Failed to save session data:', error);
      }

      return sorted;
    });
  }, [saveHistoryList]);

  // 세션 로드
  const loadSession = useCallback((id: string): HistoryStoredSession | null => {
    try {
      const stored = localStorage.getItem(getSessionStorageKey(id));
      if (stored) {
        return JSON.parse(stored) as HistoryStoredSession;
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
    return null;
  }, []);

  // lastUsedAt 업데이트
  const updateLastUsed = useCallback((id: string) => {
    const now = new Date().toISOString();

    setHistory(prevHistory => {
      const index = prevHistory.findIndex(h => h.id === id);
      if (index < 0) return prevHistory;

      const newHistory = [...prevHistory];
      newHistory[index] = { ...newHistory[index], lastUsedAt: now };

      const sorted = sortByLastUsed(newHistory);
      saveHistoryList(sorted);
      return sorted;
    });
  }, [saveHistoryList]);

  // 세션 삭제
  const deleteSession = useCallback((id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(h => h.id !== id);
      saveHistoryList(newHistory);
      localStorage.removeItem(getSessionStorageKey(id));
      return newHistory;
    });
  }, [saveHistoryList]);

  return {
    history,
    saveSession,
    loadSession,
    deleteSession,
    updateLastUsed,
  };
}
