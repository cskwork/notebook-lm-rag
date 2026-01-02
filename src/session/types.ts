export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  notebookId: string;
  notebookName: string;
  sources?: string[];
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  notebookId: string;
  notebookName: string;
  createdAt: Date;
  updatedAt: Date;
  qaHistory: QAEntry[];
  agentSessionId?: string;
  documentPath?: string;
  status: 'active' | 'generating' | 'completed';
}

export interface CreateSessionRequest {
  notebookId: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface GenerateDocRequest {
  title?: string;
  includeConclusions?: boolean;
}
