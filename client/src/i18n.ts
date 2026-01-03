export type Locale = 'en' | 'ko';

export const UI_LANGUAGE_STORAGE_KEY = 'ui-language';

export const translations = {
  en: {
    appName: 'NotebookLM Research Assistant',
    header: {
      sessionLabel: 'Session',
      languageLabel: 'Language',
      languageOptions: {
        en: 'English',
        ko: 'Korean',
      },
    },
    status: {
      active: 'active',
      completed: 'completed',
      error: 'error',
      none: 'No session',
    },
    sidebar: {
      notebookLabel: 'Notebook',
      notebookPlaceholder: 'Select a notebook...',
      loadingNotebooks: 'Loading notebooks...',
      sessionInfo: 'Session Info',
      qaCount: 'Q&A Count',
      statusLabel: 'Status',
      documentLabel: 'Document',
      documentReady: 'Ready',
      documentNotGenerated: 'Not generated',
      startSession: 'Start New Session',
      creating: 'Creating...',
      generateReport: 'Generate Report',
      generating: 'Generating...',
      downloadDocx: 'Download DOCX',
      resetChat: 'Reset Chat',
    },
    chat: {
      startTitle: 'Start a Research Session',
      startDescription:
        'Select a notebook from the sidebar and click "Start New Session" to begin asking questions and generating research reports.',
      sessionStarted: 'Session started. Ask a question to begin your research.',
      queryDetails: 'Query Details',
      assistant: 'Assistant',
      sources: 'Sources',
    },
    messageInput: {
      placeholder: 'Type your message...',
      sessionPlaceholder: 'Ask a question about your notebook...',
      sendAriaLabel: 'Send message',
      hint: 'Press Enter to send, Shift+Enter for new line',
    },
    toasts: {
      loadNotebooksFailed: 'Failed to load notebooks. Is the server running?',
      sessionStarted: 'Session started successfully',
      createSessionFailed: 'Failed to create session',
      sendMessageFailed: 'Failed to send message',
      reportGenerated: 'Report generated successfully',
      generateDocumentFailed: 'Failed to generate document',
      downloadStarted: 'Download started',
      downloadFailed: 'Failed to download document',
      sessionReset: 'Session reset',
      resetFailed: 'Failed to reset session',
      historyLoadFailed: 'Failed to load session from history',
    },
    chatHistory: {
      title: 'Chat History',
      empty: 'No chat history',
      qaCount: '{count} Q&As',
      delete: 'Delete',
      noMessages: 'No messages',
    },
  },
  ko: {
    appName: 'NotebookLM 연구 어시스턴트',
    header: {
      sessionLabel: '세션',
      languageLabel: '언어',
      languageOptions: {
        en: '영어',
        ko: '한국어',
      },
    },
    status: {
      active: '활성',
      completed: '완료',
      error: '오류',
      none: '세션 없음',
    },
    sidebar: {
      notebookLabel: '노트북',
      notebookPlaceholder: '노트북을 선택하세요...',
      loadingNotebooks: '노트북을 불러오는 중...',
      sessionInfo: '세션 정보',
      qaCount: 'Q&A 수',
      statusLabel: '상태',
      documentLabel: '문서',
      documentReady: '준비됨',
      documentNotGenerated: '미생성',
      startSession: '새 세션 시작',
      creating: '생성 중...',
      generateReport: '리포트 생성',
      generating: '생성 중...',
      downloadDocx: 'DOCX 다운로드',
      resetChat: '채팅 초기화',
    },
    chat: {
      startTitle: '리서치 세션 시작',
      startDescription:
        '사이드바에서 노트북을 선택하고 "새 세션 시작"을 눌러 질문을 시작하고 리포트를 생성하세요.',
      sessionStarted: '세션이 시작되었습니다. 질문을 입력해 연구를 시작하세요.',
      queryDetails: '쿼리 상세',
      assistant: '어시스턴트',
      sources: '출처',
    },
    messageInput: {
      placeholder: '메시지를 입력하세요...',
      sessionPlaceholder: '노트북에 대해 질문하세요...',
      sendAriaLabel: '메시지 전송',
      hint: 'Enter로 전송, Shift+Enter로 줄바꿈',
    },
    toasts: {
      loadNotebooksFailed: '노트북을 불러오지 못했습니다. 서버가 실행 중인지 확인하세요.',
      sessionStarted: '세션이 시작되었습니다.',
      createSessionFailed: '세션 생성에 실패했습니다.',
      sendMessageFailed: '메시지 전송에 실패했습니다.',
      reportGenerated: '리포트가 생성되었습니다.',
      generateDocumentFailed: '문서 생성에 실패했습니다.',
      downloadStarted: '다운로드가 시작되었습니다.',
      downloadFailed: '문서 다운로드에 실패했습니다.',
      sessionReset: '세션이 초기화되었습니다.',
      resetFailed: '세션 초기화에 실패했습니다.',
      historyLoadFailed: '히스토리에서 세션을 불러오지 못했습니다.',
    },
    chatHistory: {
      title: '채팅 기록',
      empty: '채팅 기록 없음',
      qaCount: '{count}개 Q&A',
      delete: '삭제',
      noMessages: '메시지 없음',
    },
  },
} as const;

export const timeLocaleMap: Record<Locale, string> = {
  en: 'en-US',
  ko: 'ko-KR',
};

const koreanErrorMap: Record<string, string> = {
  'Session not found': '세션을 찾을 수 없습니다.',
  'Notebook not found': '노트북을 찾을 수 없습니다.',
  'notebookId is required': '노트북 ID가 필요합니다.',
  'message is required': '메시지가 필요합니다.',
  'No Q&A history to generate document from. Please have a conversation first.':
    '문서를 생성할 Q&A 기록이 없습니다. 먼저 대화를 진행하세요.',
  'No document generated for this session. Use POST /api/sessions/:id/generate-doc first.':
    '이 세션에 생성된 문서가 없습니다. 먼저 문서를 생성하세요.',
  'Document file not found on disk': '디스크에서 문서 파일을 찾을 수 없습니다.',
  'Failed to generate document - no path in response': '문서 생성 응답에 경로가 없습니다.',
  'Unknown error': '알 수 없는 오류가 발생했습니다.',
  'Failed to download document': '문서 다운로드에 실패했습니다.',
  'HTTP 400': '요청이 올바르지 않습니다.',
  'HTTP 404': '요청한 리소스를 찾을 수 없습니다.',
  'HTTP 500': '서버 오류가 발생했습니다.',
};

export function mapApiErrorMessage(message: string, locale: Locale): string {
  if (locale === 'en') {
    return message;
  }

  const trimmed = message.trim();
  const directMatch = koreanErrorMap[trimmed];
  if (directMatch) {
    return directMatch;
  }

  const notebookMatch = trimmed.match(/^Notebook '(.+)' not found$/);
  if (notebookMatch) {
    return `노트북을 찾을 수 없습니다: ${notebookMatch[1]}`;
  }

  const httpMatch = trimmed.match(/^HTTP (\d{3})$/);
  if (httpMatch) {
    const httpKey = `HTTP ${httpMatch[1]}`;
    if (koreanErrorMap[httpKey]) {
      return koreanErrorMap[httpKey];
    }
  }

  return message;
}
