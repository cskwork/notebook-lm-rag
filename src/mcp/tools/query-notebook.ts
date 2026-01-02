import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { readLibrary } from '../../utils/library-reader.js';
import { runPythonScript } from '../../utils/python-runner.js';

export const queryNotebookTool = tool(
  'query_notebook',
  'Query a NotebookLM notebook with a question. Returns the answer with source citations. Use this to research topics from the selected notebook.',
  {
    question: z.string().describe('The question to ask NotebookLM'),
    notebook_id: z.string().optional().describe('Notebook ID to query. If not provided, uses the active notebook.')
  },
  async (args) => {
    try {
      const library = await readLibrary();

      // Resolve notebook
      let notebookUrl: string;
      let notebookName: string;

      if (args.notebook_id) {
        const notebook = library.notebooks[args.notebook_id];
        if (!notebook) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error: Notebook '${args.notebook_id}' not found in library.`
            }],
            isError: true
          };
        }
        notebookUrl = notebook.url;
        notebookName = notebook.name;
      } else {
        const activeNotebook = library.notebooks[library.active_notebook_id];
        if (!activeNotebook) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: No active notebook set. Please specify a notebook_id.'
            }],
            isError: true
          };
        }
        notebookUrl = activeNotebook.url;
        notebookName = activeNotebook.name;
      }

      // Execute Python script
      const result = await runPythonScript('ask_question.py', [
        '--question', args.question,
        '--notebook-url', notebookUrl
      ]);

      if (result.error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error querying notebook: ${result.error}`
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            notebook: notebookName,
            question: args.question,
            answer: result.output,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error: ${(error as Error).message}`
        }],
        isError: true
      };
    }
  }
);
