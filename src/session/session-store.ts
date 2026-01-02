import { randomUUID } from 'crypto';
import { ChatSession, QAEntry } from './types.js';

class SessionStore {
  private sessions: Map<string, ChatSession> = new Map();

  create(notebookId: string, notebookName: string): ChatSession {
    const session: ChatSession = {
      id: randomUUID(),
      notebookId,
      notebookName,
      createdAt: new Date(),
      updatedAt: new Date(),
      qaHistory: [],
      status: 'active'
    };
    this.sessions.set(session.id, session);
    return session;
  }

  get(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  update(sessionId: string, updates: Partial<ChatSession>): ChatSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates, { updatedAt: new Date() });
    }
    return session;
  }

  addQAEntry(
    sessionId: string,
    entry: Omit<QAEntry, 'id' | 'timestamp'>
  ): QAEntry | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      const qaEntry: QAEntry = {
        ...entry,
        id: randomUUID(),
        timestamp: new Date()
      };
      session.qaHistory.push(qaEntry);
      session.updatedAt = new Date();
      return qaEntry;
    }
    return undefined;
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  listActive(): ChatSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.status === 'active');
  }

  list(): ChatSession[] {
    return Array.from(this.sessions.values());
  }
}

export const sessionStore = new SessionStore();
