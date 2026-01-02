import { Router } from 'express';
import { notebooksRouter } from './notebooks.js';
import { sessionsRouter } from './sessions.js';
import { documentsRouter } from './documents.js';

export const apiRoutes = Router();

// 노트북 관련 엔드포인트
apiRoutes.use('/notebooks', notebooksRouter);

// 세션 관련 엔드포인트
apiRoutes.use('/sessions', sessionsRouter);

// 문서 다운로드 (세션 하위 경로)
apiRoutes.use('/sessions', documentsRouter);
