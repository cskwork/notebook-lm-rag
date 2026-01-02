import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { readLibrary } from '../../utils/library-reader.js';

export const listNotebooksTool = tool(
  'list_notebooks',
  'List all available NotebookLM notebooks from the library. Returns notebook ID, name, description, and topics for each notebook.',
  {
    include_topics: z.boolean().optional().describe('Include topic list for each notebook (default: true)')
  },
  async (args) => {
    try {
      const library = await readLibrary();
      const notebooks = Object.values(library.notebooks).map(nb => ({
        id: nb.id,
        name: nb.name,
        description: nb.description,
        url: nb.url,
        topics: args.include_topics !== false ? nb.topics : undefined,
        is_active: nb.id === library.active_notebook_id
      }));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ notebooks, count: notebooks.length }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error reading notebook library: ${(error as Error).message}`
        }],
        isError: true
      };
    }
  }
);
