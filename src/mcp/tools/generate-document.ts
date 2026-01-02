import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { generateResearchReport } from '../../docx/research-report.js';

export const generateDocumentTool = tool(
  'generate_document',
  'Generate a professional Research Report DOCX from the conversation history. Includes executive summary, findings by topic, detailed Q&A sections, and citations.',
  {
    title: z.string().describe('Report title'),
    executive_summary: z.string().describe('Executive summary text (1-2 paragraphs)'),
    findings: z.array(z.object({
      topic: z.string().describe('Topic/category name'),
      points: z.array(z.string()).describe('Key findings for this topic')
    })).describe('Research findings grouped by topic'),
    qa_sections: z.array(z.object({
      question: z.string(),
      answer: z.string(),
      source: z.string().optional().describe('Source citation if available')
    })).describe('Detailed Q&A from the research session'),
    conclusions: z.array(z.string()).optional().describe('Concluding remarks'),
    sources: z.array(z.string()).optional().describe('List of sources/citations')
  },
  async (args) => {
    try {
      const outputPath = await generateResearchReport({
        title: args.title,
        date: new Date(),
        executiveSummary: args.executive_summary,
        findings: args.findings,
        qaSections: args.qa_sections,
        conclusions: args.conclusions || [],
        sources: args.sources || []
      });

      const filename = outputPath.split(/[\\/]/).pop();

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            success: true,
            message: 'Research report generated successfully',
            path: outputPath,
            filename
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error generating document: ${(error as Error).message}`
        }],
        isError: true
      };
    }
  }
);
