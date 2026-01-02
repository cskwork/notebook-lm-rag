# Changelog 2026-01-02

## 채팅 응답 마크다운 렌더링

### 수정된 파일
- `client/src/components/ChatArea.tsx` - assistant 메시지에 Markdown(GFM) 렌더링 적용
- `client/src/main.tsx` - 코드 하이라이트 테마 로드
- `client/package.json` - 마크다운/하이라이트 의존성 추가

### 기능
- 테이블, 작업 목록, 코드 블록 포함한 Markdown 표시
- 링크 `noopener noreferrer` 적용 및 코드 문법 하이라이트

## Frontend UI 구현 - NotebookLM Research Assistant

### 추가된 파일
- `client/src/types/index.ts` - API 타입 정의 (Notebook, Session, Message 등)
- `client/src/services/api.ts` - API 서비스 레이어
- `client/src/hooks/useResearchSession.ts` - 세션 관리 커스텀 훅
- `client/src/components/Header.tsx` - 앱 헤더
- `client/src/components/Sidebar.tsx` - 노트북 선택 및 세션 컨트롤
- `client/src/components/ChatArea.tsx` - 채팅 메시지 영역
- `client/src/components/MessageInput.tsx` - 메시지 입력 컴포넌트
- `client/src/components/Toast.tsx` - 토스트 알림

### 수정된 파일
- `client/tailwind.config.js` - Tailwind CSS 설정 (primary 컬러, Inter 폰트)
- `client/vite.config.ts` - Vite 설정 (프록시, 경로 별칭 추가)
- `client/src/index.css` - Tailwind CSS 디렉티브 및 기본 스타일
- `client/src/App.tsx` - 메인 앱 컴포넌트
- `client/index.html` - Inter 폰트 추가
- `client/tsconfig.app.json` - 경로 별칭 설정

### 기능
- 노트북 선택 및 세션 생성
- 실시간 채팅 인터페이스
- 낙관적 업데이트로 빠른 UX
- DOCX 리포트 생성 및 다운로드
- 토스트 알림 시스템
- 반응형 레이아웃

### 기술 스택
- React 19 + TypeScript
- Tailwind CSS 3
- Vite 7

---

## 버그 수정 - 문서 생성 시 경로 누락 오류

### 문제
문서 생성 시 `"Failed to generate document - no path in response"` 오류 발생

### 원인
`session-manager.ts`의 `sendMessage` 메서드가 assistant 메시지 텍스트만 캡처하고, Claude Agent SDK의 tool_use_result 필드를 캡처하지 않음

### 수정
- `src/session/session-manager.ts` - user 메시지의 tool_use_result 필드 캡처 로직 추가

---

## 세션 지속성 및 초기화 기능

### 기능
- localStorage에 세션 상태 저장 (브라우저 새로고침 후에도 유지)
- "Reset Chat" 버튼으로 세션 초기화 (프론트엔드 + 백엔드 모두 삭제)
- Claude Agent SDK에 최근 3개 Q&A만 컨텍스트로 전송 (토큰 효율화)

### 수정된 파일
- `client/src/hooks/useResearchSession.ts` - localStorage 저장/복원 + resetSession 함수
- `client/src/components/Sidebar.tsx` - Reset Chat 버튼 추가
- `client/src/App.tsx` - resetSession 연결
- `client/src/services/api.ts` - deleteSession API 추가
- `src/session/session-manager.ts` - 컨텍스트 최근 3개 제한 + deleteSession 메서드
- `src/api/sessions.ts` - DELETE /:id 엔드포인트 추가

---

## 쿼리 메타데이터 접기 기능

### 문제
NotebookLM 쿼리 응답이 JSON 형태로 전체 표시되어 가독성 저하

### 수정
- `client/src/types/index.ts` - Message 인터페이스에 `thinking` 필드 추가
- `client/src/services/api.ts` - JSON 응답에서 answer와 메타데이터 분리 (`parseNotebookResponse`)
- `client/src/components/ChatArea.tsx` - 접기/펼치기 가능한 `ThinkingSection` 컴포넌트 추가

### 동작
- 응답의 실제 답변(answer)만 메인 콘텐츠로 표시
- 쿼리 메타데이터(notebook, question, timestamp)는 "Query Details" 버튼으로 접기/펼치기

---

## UI 다국어 전환 및 오류 메시지 매핑

### 추가된 파일
- `client/src/i18n.ts` - 영어/한국어 번역 리소스와 오류 메시지 매핑
- `client/src/hooks/useLocale.tsx` - 언어 상태/저장 관리 및 Provider

### 수정된 파일
- `client/src/main.tsx` - LocaleProvider 적용
- `client/src/App.tsx` - 세션 입력 플레이스홀더 다국어 처리
- `client/src/components/Header.tsx` - 헤더 언어 토글 및 라벨 번역
- `client/src/components/Sidebar.tsx` - 사이드바 문자열 번역
- `client/src/components/ChatArea.tsx` - 빈 상태/메시지 라벨 번역 및 시간 로케일 적용
- `client/src/components/MessageInput.tsx` - 입력 라벨/힌트 번역
- `client/src/hooks/useResearchSession.ts` - 토스트 메시지 번역 및 API 오류 한국어 매핑

### 기능
- 기본 UI 언어 영어, 헤더에서 한국어로 전환 가능 (localStorage 저장)
- 모든 UI 텍스트 및 시간 포맷 로케일 전환
- 알려진 API 오류 메시지 한국어 매핑
