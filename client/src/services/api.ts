// API 서비스 레이어
import type {
  Notebook,
  Session,
  CreateSessionRequest,
  SendMessageRequest,
  GenerateDocResponse,
  Message,
} from '../types';

const API_BASE = '/api';

// Backend 응답 타입들
interface BackendSession {
  id: string;
  notebookId: string;
  notebookName: string;
  status: string;
  qaHistory?: Array<{
    id: string;
    question: string;
    answer: string;
    timestamp: string;
  }>;
  documentPath?: string;
  createdAt: string;
  updatedAt?: string;
}

interface BackendMessageResponse {
  response: string;
  qaEntry?: {
    id: string;
    question: string;
    timestamp: string;
  };
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Backend Session을 Frontend Session으로 변환
  private transformSession(backend: BackendSession): Session {
    const messages: Message[] = [];

    if (backend.qaHistory) {
      backend.qaHistory.forEach((qa) => {
        // User message
        messages.push({
          id: `${qa.id}-q`,
          role: 'user',
          content: qa.question,
          timestamp: qa.timestamp,
        });
        // Assistant message - answer와 메타데이터 분리
        const { content, thinking } = this.parseNotebookResponse(qa.answer);
        messages.push({
          id: `${qa.id}-a`,
          role: 'assistant',
          content,
          timestamp: qa.timestamp,
          thinking,
        });
      });
    }

    return {
      id: backend.id,
      notebookId: backend.notebookId,
      notebookName: backend.notebookName,
      status: backend.status as 'active' | 'completed' | 'error',
      messages,
      createdAt: backend.createdAt,
      updatedAt: backend.updatedAt || backend.createdAt,
      documentGenerated: !!backend.documentPath,
    };
  }

  // 노트북 목록 조회
  async getNotebooks(): Promise<Notebook[]> {
    const response = await this.request<{ notebooks: Notebook[]; count: number }>('/notebooks');
    return response.notebooks;
  }

  // 세션 생성
  async createSession(data: CreateSessionRequest): Promise<Session> {
    const response = await this.request<{ session: BackendSession; message: string }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.transformSession(response.session);
  }

  // 세션 목록 조회
  async getSessions(): Promise<Session[]> {
    const response = await this.request<{ sessions: BackendSession[]; count: number }>('/sessions');
    return response.sessions.map((s) => this.transformSession(s));
  }

  // 세션 상세 조회
  async getSession(sessionId: string): Promise<Session> {
    const response = await this.request<{ session: BackendSession }>(`/sessions/${sessionId}`);
    return this.transformSession(response.session);
  }

  // 세션 삭제
  async deleteSession(sessionId: string): Promise<void> {
    await this.request<{ success: boolean }>(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // NotebookLM 쿼리 응답에서 answer와 메타데이터 분리
  private parseNotebookResponse(responseText: string): { content: string; thinking?: string } {
    try {
      // JSON 응답인지 확인 (NotebookLM 쿼리 결과)
      const parsed = JSON.parse(responseText);
      if (parsed && typeof parsed.answer === 'string') {
        // answer 필드가 있으면 메타데이터와 분리
        return {
          content: parsed.answer,
          thinking: JSON.stringify(parsed, null, 2),
        };
      }
    } catch {
      // JSON이 아닌 경우 무시
    }
    return { content: responseText };
  }

  // 메시지 전송
  async sendMessage(sessionId: string, data: SendMessageRequest): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const response = await this.request<BackendMessageResponse>(`/sessions/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const timestamp = new Date().toISOString();
    const userMessage: Message = {
      id: response.qaEntry?.id ? `${response.qaEntry.id}-q` : `msg-${Date.now()}-q`,
      role: 'user',
      content: data.message,
      timestamp: response.qaEntry?.timestamp || timestamp,
    };

    // 응답에서 answer와 메타데이터 분리
    const { content, thinking } = this.parseNotebookResponse(response.response);

    const assistantMessage: Message = {
      id: response.qaEntry?.id ? `${response.qaEntry.id}-a` : `msg-${Date.now()}-a`,
      role: 'assistant',
      content,
      timestamp: response.qaEntry?.timestamp || timestamp,
      thinking,
    };

    return { userMessage, assistantMessage };
  }

  // 문서 생성
  async generateDocument(sessionId: string): Promise<GenerateDocResponse> {
    const response = await this.request<{ success: boolean; filename: string; path: string; downloadUrl: string }>(
      `/sessions/${sessionId}/generate-doc`,
      { method: 'POST' }
    );
    return {
      success: response.success,
      filename: response.filename,
    };
  }

  // 문서 다운로드 URL 생성
  getDocumentDownloadUrl(sessionId: string): string {
    return `${API_BASE}/sessions/${sessionId}/document`;
  }

  // 문서 다운로드
  async downloadDocument(sessionId: string): Promise<void> {
    const url = this.getDocumentDownloadUrl(sessionId);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'report.docx';

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match) {
        filename = match[1];
      }
    }

    // 브라우저 다운로드 트리거
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }
}

export const api = new ApiService();
