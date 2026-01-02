import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,

  // NotebookLM skill paths
  NOTEBOOKLM_SKILL_DIR: 'C:\\Users\\a\\.claude\\skills\\notebooklm-skill',
  LIBRARY_PATH: 'C:\\Users\\a\\.claude\\skills\\notebooklm-skill\\data\\library.json',

  // Output directory for generated documents
  OUTPUT_DIR: path.join(path.dirname(__dirname), 'output'),

  // Claude model
  CLAUDE_MODEL: 'claude-sonnet-4-5-20250929'
} as const;
