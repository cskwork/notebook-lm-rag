// API 응답 및 요청 타입 정의

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  url: string;
  topics?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Source[];
  thinking?: string; // 쿼리 메타데이터 (접힌 상태로 표시)
}

export interface Source {
  title: string;
  excerpt?: string;
}

export interface Session {
  id: string;
  notebookId: string;
  notebookName: string;
  status: 'active' | 'completed' | 'error';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  documentGenerated?: boolean;
}

export interface CreateSessionRequest {
  notebookId: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface GenerateDocResponse {
  success: boolean;
  filename?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

// 채팅 히스토리 엔트리 (목록 표시용 메타데이터)
export interface HistoryEntry {
  id: string;
  notebookId: string;
  notebookName: string;
  messageCount: number;
  lastMessagePreview: string;
  createdAt: string;
  lastUsedAt: string;
}

// 히스토리에 저장되는 전체 세션 데이터
export interface HistoryStoredSession {
  session: Session;
  selectedNotebook: Notebook;
}
