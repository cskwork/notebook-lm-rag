import express from 'express';
import cors from 'cors';
import { apiRoutes } from './api/routes.js';
import { CONFIG } from './config.js';

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 상태 체크 엔드포인트
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 라우트
app.use('/api', apiRoutes);

// 정적 파일 서빙 (생성된 문서)
app.use('/output', express.static(CONFIG.OUTPUT_DIR));

// 에러 핸들러
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// 서버 시작
app.listen(CONFIG.PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           NotebookLM RAG Agent Server                      ║
╠════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${CONFIG.PORT}                  ║
║                                                            ║
║  Available endpoints:                                      ║
║    GET  /health                 - Health check             ║
║    GET  /api/notebooks          - List notebooks           ║
║    POST /api/sessions           - Create session           ║
║    GET  /api/sessions           - List sessions            ║
║    GET  /api/sessions/:id       - Get session details      ║
║    POST /api/sessions/:id/message   - Send message         ║
║    POST /api/sessions/:id/generate-doc  - Generate DOCX    ║
║    GET  /api/sessions/:id/document  - Download DOCX        ║
╚════════════════════════════════════════════════════════════╝
  `);
});
