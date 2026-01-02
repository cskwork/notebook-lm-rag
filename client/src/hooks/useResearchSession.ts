// 연구 세션 관리 훅
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Notebook, Session, Message } from '../types';
import type { ToastMessage } from '../components';
import { api } from '../services/api';

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

  // 노트북 목록 로드
  useEffect(() => {
    const loadNotebooks = async () => {
      try {
        setIsLoadingNotebooks(true);
        const data = await api.getNotebooks();
        setNotebooks(data);
      } catch (error) {
        console.error('Failed to load notebooks:', error);
        addToast('error', 'Failed to load notebooks. Is the server running?');
      } finally {
        setIsLoadingNotebooks(false);
      }
    };

    loadNotebooks();
  }, [addToast]);

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
      addToast('success', 'Session started successfully');
    } catch (error) {
      console.error('Failed to create session:', error);
      addToast('error', error instanceof Error ? error.message : 'Failed to create session');
    } finally {
      setIsCreatingSession(false);
    }
  }, [selectedNotebook, addToast]);

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
      addToast('error', error instanceof Error ? error.message : 'Failed to send message');

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
  }, [session, addToast]);

  // 문서 생성
  const generateDocument = useCallback(async () => {
    if (!session) return;

    try {
      setIsGeneratingDoc(true);
      const result = await api.generateDocument(session.id);

      if (result.success) {
        setSession((prev) => (prev ? { ...prev, documentGenerated: true } : null));
        addToast('success', 'Report generated successfully');
      } else {
        addToast('error', result.message ?? 'Failed to generate document');
      }
    } catch (error) {
      console.error('Failed to generate document:', error);
      addToast('error', error instanceof Error ? error.message : 'Failed to generate document');
    } finally {
      setIsGeneratingDoc(false);
    }
  }, [session, addToast]);

  // 문서 다운로드
  const downloadDocument = useCallback(async () => {
    if (!session) return;

    try {
      await api.downloadDocument(session.id);
      addToast('success', 'Download started');
    } catch (error) {
      console.error('Failed to download document:', error);
      addToast('error', error instanceof Error ? error.message : 'Failed to download document');
    }
  }, [session, addToast]);

  // 세션 초기화
  const resetSession = useCallback(async () => {
    try {
      if (session) {
        await api.deleteSession(session.id);
      }
      setSession(null);
      setSelectedNotebook(null);
      localStorage.removeItem(STORAGE_KEY);
      addToast('success', 'Session reset');
    } catch (error) {
      console.error('Failed to reset session:', error);
      addToast('error', error instanceof Error ? error.message : 'Failed to reset session');
    }
  }, [session, addToast]);

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
