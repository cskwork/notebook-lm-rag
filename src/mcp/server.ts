import { createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { listNotebooksTool } from './tools/list-notebooks.js';
import { queryNotebookTool } from './tools/query-notebook.js';
import { generateDocumentTool } from './tools/generate-document.js';

export const notebookMcpServer = createSdkMcpServer({
  name: 'notebooklm-rag',
  version: '1.0.0',
  tools: [
    listNotebooksTool,
    queryNotebookTool,
    generateDocumentTool
  ]
});
