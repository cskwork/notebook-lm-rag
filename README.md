# NotebookLM RAG Agent

A full-stack web application that queries Google NotebookLM notebooks and generates professional research reports from conversation history. Combines Claude AI's agent capabilities with a React frontend to create an intelligent research assistant.

## Features

- **Multi-turn Research Conversations** - Maintain context across multiple questions
- **Source Citations** - Track and display notebook sources in responses
- **Document Generation** - Create professional DOCX reports automatically
- **Session Management** - Save and retrieve conversation history
- **Korean Font Support** - Documents use "맑은 고딕" font

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + TypeScript + Express |
| Frontend | React 19 + TypeScript + Tailwind CSS + Vite |
| AI | Anthropic Claude Agent SDK |
| Documents | docx library |
| NotebookLM | Python + Patchright (browser automation) |

## Project Structure

```
notebook-lm-rag/
├── src/                    # Backend source
│   ├── api/                # Express route handlers
│   ├── mcp/tools/          # MCP tools (list, query, generate)
│   ├── session/            # Session management
│   ├── docx/               # Document generation
│   └── utils/              # Python runner, library reader
├── client/                 # React frontend
│   ├── src/components/     # UI components
│   ├── src/hooks/          # Custom React hooks
│   └── src/services/       # API client
├── .claude/skills/         # Claude Code skills
│   └── notebooklm-skill/   # NotebookLM Python automation
├── output/                 # Generated DOCX files
└── docs/                   # Documentation
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notebooks` | List available notebooks |
| POST | `/api/sessions` | Create new research session |
| GET | `/api/sessions/:id` | Get session with Q&A history |
| POST | `/api/sessions/:id/message` | Send query to notebook |
| POST | `/api/sessions/:id/generate-doc` | Generate DOCX report |
| GET | `/api/sessions/:id/document` | Download generated document |

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+ (for NotebookLM skill)
- Anthropic API key

### Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

### NotebookLM Skill Setup

```bash
cd .claude/skills/notebooklm-skill

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Setup authentication (opens browser for Google login)
python scripts/auth_manager.py setup
```

### Running

```bash
# Start backend (port 5175)
npm run dev

# Start frontend (port 5173)
cd client
npm run dev
```

## Usage

1. Open `http://localhost:5173`
2. Select a notebook from the sidebar
3. Create a new research session
4. Ask questions - responses include NotebookLM citations
5. Click "Generate Document" to create a DOCX report

## MCP Tools

The backend exposes three MCP tools for Claude Agent:

- **list_notebooks** - Enumerate available NotebookLM notebooks
- **query_notebook** - Ask questions to a specific notebook
- **generate_document** - Create DOCX research report from session Q&A

## License

MIT
