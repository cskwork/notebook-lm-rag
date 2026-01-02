import * as fs from 'fs';
import { CONFIG } from '../config.js';

export interface Notebook {
  id: string;
  url: string;
  name: string;
  description: string;
  topics: string[];
  content_types: string[];
  use_cases: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  use_count: number;
  last_used: string | null;
}

export interface Library {
  notebooks: Record<string, Notebook>;
  active_notebook_id: string;
  updated_at: string;
}

export async function readLibrary(): Promise<Library> {
  const content = fs.readFileSync(CONFIG.LIBRARY_PATH, 'utf-8');
  return JSON.parse(content) as Library;
}

export async function getNotebook(notebookId: string): Promise<Notebook | null> {
  const library = await readLibrary();
  return library.notebooks[notebookId] || null;
}

export async function getActiveNotebook(): Promise<Notebook | null> {
  const library = await readLibrary();
  if (!library.active_notebook_id) return null;
  return library.notebooks[library.active_notebook_id] || null;
}
