import { Router, Request, Response } from 'express';
import { readLibrary } from '../utils/library-reader.js';

export const notebooksRouter = Router();

// GET /api/notebooks - 모든 노트북 목록 조회
notebooksRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const library = await readLibrary();
    const notebooks = Object.values(library.notebooks).map(nb => ({
      id: nb.id,
      name: nb.name,
      description: nb.description,
      url: nb.url,
      topics: nb.topics,
      is_active: nb.id === library.active_notebook_id
    }));

    res.json({
      notebooks,
      count: notebooks.length,
      active_notebook_id: library.active_notebook_id
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/notebooks/:id - 특정 노트북 조회
notebooksRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const library = await readLibrary();
    const notebook = library.notebooks[req.params.id];

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    res.json({
      notebook: {
        ...notebook,
        is_active: notebook.id === library.active_notebook_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
