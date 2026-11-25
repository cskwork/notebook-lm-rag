# NotebookLM RAG Project

## Overview
Query NotebookLM notebooks and generate professional documents from the results.

## NotebookLM Skill

### Quick Commands
```bash
# Check auth
cd "C:\Users\a\.claude\skills\notebooklm-skill"
".venv\Scripts\python.exe" scripts/auth_manager.py status

# Setup auth (opens browser for Google login)
".venv\Scripts\python.exe" scripts/auth_manager.py setup

# List notebooks
".venv\Scripts\python.exe" scripts/notebook_manager.py list

# Add notebook (query first to discover content)
".venv\Scripts\python.exe" scripts/ask_question.py --question "What is the content of this notebook?" --notebook-url "URL"
".venv\Scripts\python.exe" scripts/notebook_manager.py add --url "URL" --name "NAME" --description "DESC" --topics "t1,t2"

# Query notebook
".venv\Scripts\python.exe" scripts/ask_question.py --question "질문" --notebook-url "URL"
".venv\Scripts\python.exe" scripts/ask_question.py --question "질문"  # uses active notebook
```

### Notebook Library
| ID | Name | URL |
|----|------|-----|
| ai-digital-textbook-platform-(aidt) | AI Digital Textbook Platform | notebook/a0c47678-7504-469f-bc51-d09a4da22498 |

## Document Generation (docx skill)

### Workflow
1. Query NotebookLM for content
2. Use `/docx` skill to create Word documents
3. Read `docx-js.md` for new documents, `ooxml.md` for editing

### Key Files
- `meeting-briefing.js` - Template for meeting briefing documents

## Insights

<insight>
- NotebookLM query input is disabled when notebook has no sources - check for this before querying
- Chrome browser may be logged into different Google account than NotebookLM skill auth - use patchright-based queries instead
- Always use Smart Add workflow: query notebook content first, then add with discovered metadata
- Korean font: use "맑은 고딕" for Word documents
- docx module must be installed locally: `npm install docx`
- UI 언어 설정은 localStorage 키 `ui-language`로 관리
- assistant 마크다운 렌더링은 react-markdown + remark-gfm + rehype-sanitize + rehype-highlight 조합
- NotebookLM 도구 출력은 응답과 분리해 thinking으로 저장하면 채팅 본문에 JSON이 노출되지 않음
</insight>
