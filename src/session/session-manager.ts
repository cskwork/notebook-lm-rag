import { query } from '@anthropic-ai/claude-agent-sdk';
import { notebookMcpServer } from '../mcp/server.js';
import { sessionStore } from './session-store.js';
import { ChatSession, QAEntry } from './types.js';
import { CONFIG } from '../config.js';

const SYSTEM_PROMPT = `You are a research assistant that helps users query NotebookLM notebooks and generate professional research reports.

Your capabilities:
1. **list_notebooks** - Show all available notebooks in the library
2. **query_notebook** - Ask questions to the current or specified notebook
3. **generate_document** - Create a professional DOCX research report

Guidelines:
- When the user asks a question about the notebook content, use query_notebook to get information from NotebookLM
- Track all Q&A pairs for later document generation
- Extract and note source citations from NotebookLM responses
- Group related questions by topic for organized reports
- When asked to generate a document, synthesize all findings into a comprehensive research report

Response format:
- Provide clear, well-structured answers
- Highlight key findings and insights
- Note when information comes from specific sources
- Suggest follow-up questions when appropriate

Language: Respond in the same language as the user's query.`;

export class SessionManager {
  async createSession(notebookId: string, notebookName: string): Promise<ChatSession> {
    return sessionStore.create(notebookId, notebookName);
  }

  async sendMessage(sessionId: string, userMessage: string): Promise<{
    response: string;
    qaEntry?: QAEntry;
  }> {
    const session = sessionStore.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // 이전 대화 컨텍스트 구성 (최근 3개만 사용)
    const contextMessages = session.qaHistory.slice(-3).map(qa =>
      `Q: ${qa.question}\nA: ${qa.answer}`
    ).join('\n\n');

    const fullPrompt = contextMessages
      ? `Previous conversation:\n${contextMessages}\n\nCurrent notebook: ${session.notebookName}\n\nNew message: ${userMessage}`
      : `Current notebook: ${session.notebookName}\n\nMessage: ${userMessage}`;

    // Claude Agent SDK로 쿼리
    let responseText = '';
    let newSessionId: string | undefined;

    for await (const msg of query({
      prompt: fullPrompt,
      options: {
        model: CONFIG.CLAUDE_MODEL,
        systemPrompt: SYSTEM_PROMPT,
        mcpServers: {
          'notebooklm-rag': notebookMcpServer
        },
        allowedTools: [
          'mcp__notebooklm-rag__list_notebooks',
          'mcp__notebooklm-rag__query_notebook',
          'mcp__notebooklm-rag__generate_document'
        ],
        maxTurns: 10
      }
    })) {
      newSessionId = msg.session_id;

      if (msg.type === 'assistant' && msg.message?.content) {
        for (const block of msg.message.content) {
          if ('text' in block) {
            responseText += block.text;
          }
        }
      }

      // 도구 결과 캡처 (generate_document 등)
      if (msg.type === 'user' && msg.tool_use_result) {
        console.log('[sendMessage] Captured tool_use_result:', JSON.stringify(msg.tool_use_result).substring(0, 200));
        // tool_use_result는 [{type: 'text', text: '...'}] 형태
        const toolResult = msg.tool_use_result as Array<{type: string; text?: string}>;
        if (Array.isArray(toolResult)) {
          for (const block of toolResult) {
            if (block.type === 'text' && block.text) {
              responseText += '\n' + block.text;
            }
          }
        } else if (typeof msg.tool_use_result === 'string') {
          responseText += '\n' + msg.tool_use_result;
        }
      }
    }

    // 세션 ID 업데이트
    if (newSessionId && !session.agentSessionId) {
      sessionStore.update(sessionId, { agentSessionId: newSessionId });
    }

    // Q&A 엔트리 추가
    let qaEntry: QAEntry | undefined;
    if (responseText && !responseText.toLowerCase().includes('error')) {
      qaEntry = sessionStore.addQAEntry(sessionId, {
        question: userMessage,
        answer: responseText,
        notebookId: session.notebookId,
        notebookName: session.notebookName
      });
    }

    return { response: responseText, qaEntry };
  }

  async generateDocument(sessionId: string, options?: {
    title?: string;
    includeConclusions?: boolean;
  }): Promise<string> {
    const session = sessionStore.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.qaHistory.length === 0) {
      throw new Error('No Q&A history to generate document from');
    }

    sessionStore.update(sessionId, { status: 'generating' });

    // 에이전트에게 문서 생성 요청
    const qaList = session.qaHistory.map((qa, i) =>
      `${i + 1}. Q: ${qa.question}\n   A: ${qa.answer}`
    ).join('\n\n');

    const generatePrompt = `Based on our research conversation, please generate a comprehensive Research Report document using the generate_document tool.

Research Session Summary:
- Notebook: ${session.notebookName}
- Total Q&A pairs: ${session.qaHistory.length}

Q&A History:
${qaList}

Requirements:
- Title: "${options?.title || `${session.notebookName} Research Report`}"
- Create an executive summary synthesizing the key findings
- Group findings by topic based on the questions asked
- Include all Q&A pairs in the detailed sections
- ${options?.includeConclusions !== false ? 'Add concluding remarks based on the research' : 'Skip conclusions section'}
- List all sources mentioned in the answers

Please use the generate_document tool now.`;

    const result = await this.sendMessage(sessionId, generatePrompt);

    // 디버그: 응답 내용 확인
    console.log('[generateDocument] Response length:', result.response.length);
    console.log('[generateDocument] Response preview:', result.response.substring(0, 500));

    // 응답에서 문서 경로 추출
    const pathMatch = result.response.match(/"path":\s*"([^"]+)"/);
    if (pathMatch) {
      const docPath = pathMatch[1];
      sessionStore.update(sessionId, {
        documentPath: docPath,
        status: 'completed'
      });
      return docPath;
    }

    sessionStore.update(sessionId, { status: 'active' });
    throw new Error('Failed to generate document - no path in response');
  }

  getSession(sessionId: string): ChatSession | undefined {
    return sessionStore.get(sessionId);
  }

  deleteSession(sessionId: string): boolean {
    return sessionStore.delete(sessionId);
  }

  listSessions(): ChatSession[] {
    return sessionStore.list();
  }
}

export const sessionManager = new SessionManager();
