import { Router, Request, Response } from 'express';
import { sessionManager } from '../session/session-manager.js';
import { readLibrary } from '../utils/library-reader.js';

export const sessionsRouter = Router();

// POST /api/sessions - 새 세션 생성
sessionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.body;

    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId is required' });
    }

    const library = await readLibrary();
    const notebook = library.notebooks[notebookId];

    if (!notebook) {
      return res.status(404).json({ error: `Notebook '${notebookId}' not found` });
    }

    const session = await sessionManager.createSession(notebookId, notebook.name);

    res.status(201).json({
      session: {
        id: session.id,
        notebookId: session.notebookId,
        notebookName: session.notebookName,
        status: session.status,
        createdAt: session.createdAt
      },
      message: `Session created for notebook: ${notebook.name}`
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/sessions - 모든 세션 목록
sessionsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const sessions = sessionManager.listSessions();

    res.json({
      sessions: sessions.map(s => ({
        id: s.id,
        notebookId: s.notebookId,
        notebookName: s.notebookName,
        status: s.status,
        qaCount: s.qaHistory.length,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        hasDocument: !!s.documentPath
      })),
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/sessions/:id - 특정 세션 조회
sessionsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const session = sessionManager.getSession(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      session: {
        id: session.id,
        notebookId: session.notebookId,
        notebookName: session.notebookName,
        status: session.status,
        qaHistory: session.qaHistory,
        documentPath: session.documentPath,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/sessions/:id/message - 메시지 전송
sessionsRouter.post('/:id/message', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const session = sessionManager.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const result = await sessionManager.sendMessage(req.params.id, message);

    res.json({
      response: result.response,
      qaEntry: result.qaEntry ? {
        id: result.qaEntry.id,
        question: result.qaEntry.question,
        timestamp: result.qaEntry.timestamp
      } : undefined
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/sessions/:id/generate-doc - 문서 생성
sessionsRouter.post('/:id/generate-doc', async (req: Request, res: Response) => {
  try {
    const { title, includeConclusions } = req.body;

    const session = sessionManager.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.qaHistory.length === 0) {
      return res.status(400).json({
        error: 'No Q&A history to generate document from. Please have a conversation first.'
      });
    }

    const docPath = await sessionManager.generateDocument(req.params.id, {
      title,
      includeConclusions
    });

    res.json({
      success: true,
      path: docPath,
      filename: docPath.split(/[\\/]/).pop(),
      downloadUrl: `/api/sessions/${req.params.id}/document`
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
