import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Project root is one level up from src/
const PROJECT_ROOT = path.dirname(__dirname);
const NOTEBOOKLM_SKILL_DIR = path.join(PROJECT_ROOT, '.claude', 'skills', 'notebooklm-skill');

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 5175,

  // NotebookLM skill paths (relative to project root)
  NOTEBOOKLM_SKILL_DIR,
  LIBRARY_PATH: path.join(NOTEBOOKLM_SKILL_DIR, 'data', 'library.json'),

  // Output directory for generated documents
  OUTPUT_DIR: path.join(path.dirname(__dirname), 'output'),

  // Claude model
  CLAUDE_MODEL: 'claude-sonnet-4-5-20250929',

  // Extended thinking budget (tokens)
  MAX_THINKING_TOKENS: 4000
} as const;
