// 연구 세션 관리 훅
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Notebook, Session, Message } from '../types';
import type { ToastMessage } from '../components';
import { api } from '../services/api';
import { useLocale } from './useLocale';

const STORAGE_KEY = 'research-session';

interface StoredState {
  session: Session | null;
  selectedNotebook: Notebook | null;
}

interface UseResearchSessionReturn {
  notebooks: Notebook[];
  selectedNotebook: Notebook | null;
  session: Session | null;
  isLoadingNotebooks: boolean;
  isCreatingSession: boolean;
  isSendingMessage: boolean;
  isGeneratingDoc: boolean;
  toasts: ToastMessage[];
  selectNotebook: (notebook: Notebook) => void;
  createSession: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  generateDocument: () => Promise<void>;
  downloadDocument: () => Promise<void>;
  dismissToast: (id: string) => void;
  resetSession: () => Promise<void>;
}

export function useResearchSession(): UseResearchSessionReturn {
  const { t, mapApiError } = useLocale();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingNotebooks, setIsLoadingNotebooks] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const isInitialLoad = useRef(true);

  // localStorage에서 상태 복원
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { session: storedSession, selectedNotebook: storedNotebook } = JSON.parse(stored) as StoredState;
        if (storedSession) setSession(storedSession);
        if (storedNotebook) setSelectedNotebook(storedNotebook);
      }
    } catch (error) {
      console.error('Failed to load session from localStorage:', error);
    }
    isInitialLoad.current = false;
  }, []);

  // localStorage에 상태 저장
  useEffect(() => {
    if (isInitialLoad.current) return;
    try {
      const state: StoredState = { session, selectedNotebook };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save session to localStorage:', error);
    }
  }, [session, selectedNotebook]);

  // 토스트 추가 헬퍼
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  // 토스트 제거
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getErrorMessage = useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof Error) {
        const mapped = mapApiError(error.message);
        return mapped || fallback;
      }
      return fallback;
    },
    [mapApiError]
  );

  // 노트북 목록 로드
  useEffect(() => {
    const loadNotebooks = async () => {
      try {
        setIsLoadingNotebooks(true);
        const data = await api.getNotebooks();
        setNotebooks(data);
      } catch (error) {
        console.error('Failed to load notebooks:', error);
        addToast('error', t.toasts.loadNotebooksFailed);
      } finally {
        setIsLoadingNotebooks(false);
      }
    };

    loadNotebooks();
  }, [addToast, t]);

  // 노트북 선택
  const selectNotebook = useCallback((notebook: Notebook) => {
    setSelectedNotebook(notebook);
  }, []);

  // 세션 생성
  const createSession = useCallback(async () => {
    if (!selectedNotebook) return;

    try {
      setIsCreatingSession(true);
      const newSession = await api.createSession({ notebookId: selectedNotebook.id });
      setSession(newSession);
      addToast('success', t.toasts.sessionStarted);
    } catch (error) {
      console.error('Failed to create session:', error);
      addToast('error', getErrorMessage(error, t.toasts.createSessionFailed));
    } finally {
      setIsCreatingSession(false);
    }
  }, [selectedNotebook, addToast, getErrorMessage, t]);

  // 메시지 전송
  const sendMessage = useCallback(async (message: string) => {
    if (!session) return;

    // 사용자 메시지 즉시 추가 (낙관적 업데이트)
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setSession((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, userMessage],
          }
        : null
    );

    try {
      setIsSendingMessage(true);
      const { assistantMessage } = await api.sendMessage(session.id, { message });

      // 어시스턴트 응답 추가
      setSession((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, assistantMessage],
            }
          : null
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      addToast('error', getErrorMessage(error, t.toasts.sendMessageFailed));

      // 실패 시 사용자 메시지 제거
      setSession((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((m) => m.id !== userMessage.id),
            }
          : null
      );
    } finally {
      setIsSendingMessage(false);
    }
  }, [session, addToast, getErrorMessage, t]);

  // 문서 생성
  const generateDocument = useCallback(async () => {
    if (!session) return;

    try {
      setIsGeneratingDoc(true);
      const result = await api.generateDocument(session.id);

      if (result.success) {
        setSession((prev) => (prev ? { ...prev, documentGenerated: true } : null));
        addToast('success', t.toasts.reportGenerated);
      } else {
        addToast(
          'error',
          result.message ? mapApiError(result.message) : t.toasts.generateDocumentFailed
        );
      }
    } catch (error) {
      console.error('Failed to generate document:', error);
      addToast('error', getErrorMessage(error, t.toasts.generateDocumentFailed));
    } finally {
      setIsGeneratingDoc(false);
    }
  }, [session, addToast, getErrorMessage, mapApiError, t]);

  // 문서 다운로드
  const downloadDocument = useCallback(async () => {
    if (!session) return;

    try {
      await api.downloadDocument(session.id);
      addToast('success', t.toasts.downloadStarted);
    } catch (error) {
      console.error('Failed to download document:', error);
      addToast('error', getErrorMessage(error, t.toasts.downloadFailed));
    }
  }, [session, addToast, getErrorMessage, t]);

  // 세션 초기화 (서버 세션 없어도 로컬 상태는 정리)
  const resetSession = useCallback(async () => {
    try {
      if (session) {
        await api.deleteSession(session.id);
      }
    } catch (error) {
      // 서버에 세션이 없어도 로컬 정리는 진행
      console.warn('Server session already gone:', error);
    }
    // 항상 로컬 상태 정리
    setSession(null);
    setSelectedNotebook(null);
    localStorage.removeItem(STORAGE_KEY);
    addToast('success', t.toasts.sessionReset);
  }, [session, addToast, t]);

  return {
    notebooks,
    selectedNotebook,
    session,
    isLoadingNotebooks,
    isCreatingSession,
    isSendingMessage,
    isGeneratingDoc,
    toasts,
    selectNotebook,
    createSession,
    sendMessage,
    generateDocument,
    downloadDocument,
    dismissToast,
    resetSession,
  };
}
