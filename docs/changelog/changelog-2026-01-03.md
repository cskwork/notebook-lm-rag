# Changelog 2026-01-03

## 채팅 히스토리 기능 추가

### 신규 파일
- `client/src/hooks/useChatHistory.ts` - 히스토리 관리 훅
- `client/src/components/ChatHistory.tsx` - 히스토리 목록 UI 컴포넌트

### 수정 파일
- `client/src/types/index.ts` - HistoryEntry, HistoryStoredSession 타입 추가
- `client/src/hooks/useResearchSession.ts` - 히스토리 저장/로드 통합
- `client/src/components/Sidebar.tsx` - 히스토리 섹션 추가
- `client/src/App.tsx` - 히스토리 props 연결
- `client/src/i18n.ts` - 히스토리 관련 번역 추가 (EN/KO)
- `client/src/hooks/index.ts` - useChatHistory export
- `client/src/components/index.ts` - ChatHistory export

### 기능 상세
- localStorage에 최대 10개 세션 저장
- 사이드바 상단에 히스토리 목록 표시
- 최근 사용순 정렬
- 클릭 시 세션 복원 및 채팅 계속 가능
- 메시지 전송 시 자동 저장
- 삭제 버튼 (hover 시 표시)
- 상대 시간 표시 (방금, 분/시간/일 전)
