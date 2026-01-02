import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { sessionManager } from '../session/session-manager.js';

export const documentsRouter = Router();

// GET /api/sessions/:id/document - 생성된 문서 다운로드
documentsRouter.get('/:id/document', async (req: Request, res: Response) => {
  try {
    const session = sessionManager.getSession(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.documentPath) {
      return res.status(404).json({
        error: 'No document generated for this session. Use POST /api/sessions/:id/generate-doc first.'
      });
    }

    if (!fs.existsSync(session.documentPath)) {
      return res.status(404).json({ error: 'Document file not found on disk' });
    }

    const filename = path.basename(session.documentPath);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(session.documentPath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
