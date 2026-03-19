# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start both API server (port 3000) and Vite dev server (port 5173) concurrently
- `npm run dev:api` - Start only the Express API server
- `npm run dev:web` - Start only the Vite dev server

### CLI
- `npm run cli "text to translate"` - Run translation via CLI

### Production
- `npm run build` - Build React app for production
- `npm run start` - Start production server (serves both API and static React files)

### Installation
```bash
npm install           # Root dependencies
cd web && npm install # Web dependencies
```

## Architecture

This is a monorepo-style English learning assistant with CLI translation and web history viewer.

### Module Structure
```
cli/          # CLI entry point for translation
server/       # Express.js API server
shared/       # Shared modules (AI, DB, config)
web/          # React frontend with Vite
database/     # SQLite database (created at runtime)
openspec/     # Requirements/specifications (archived changes)
```

### Key Design Patterns

**Shared Module Pattern**: `cli/` and `server/` both import from `shared/` to avoid code duplication. The shared modules handle:
- AI translation (`shared/ai.ts`) - OpenAI-compatible client
- Database (`shared/db.ts`) - SQLite with better-sqlite3
- Configuration (`shared/config.ts`) - Environment variable management

**Database First Creation**: SQLite database and schema are auto-created on first run. The database file lives at `database/english_assistant.db`.

**WAL Mode**: Database runs in WAL mode for concurrent access between CLI writes and server reads.

**CLI Exit Codes**: The CLI uses standard exit codes (0=success, 1=error) and outputs only the translation or error message to stdout for AHK integration.

### TypeScript Configuration
- Root `tsconfig.json` only compiles `cli/`, `server/`, and `shared/`
- `web/` has its own TypeScript configuration via Vite
- Node.js v22+ requires `--import tsx/esm` flag (not `--loader`)

### AI Integration
Uses OpenAI SDK with configurable API endpoint. The system prompt is hardcoded in `shared/ai.ts` as a professional English-Chinese translator that returns only the translated text.

### Environment Variables
Required in `.env`:
- `OPENAI_API_KEY` - API authentication key
- `OPENAI_BASE_URL` - API endpoint (default: https://api.openai.com/v1)
- `OPENAI_MODEL` - Model name (default: gpt-4o-mini)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Set to 'production' for production builds

### Database Schema
```sql
CREATE TABLE translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original TEXT NOT NULL,
    translated TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_translations_created_at ON translations(created_at DESC);
```

### API Endpoints
- `GET /api/health` - Health check returns `{ status: 'ok' }`
- `GET /api/translations` - Returns all translations sorted by `created_at DESC`

### Frontend
React 19 with Tailwind CSS (loaded via CDN, not npm). Kanban layout with two columns: Recent (last 7 days) and Older (before 7 days).

## AHK Testing (Windows Only)

The AutoHotkey script (`cli/Translate.ahk`) can be tested directly without UIA text capture:

```bash
# Test with hardcoded text (outputs to stdout and shows GUI)
"C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" //ErrorStdOut "E:\Code\EnglishAssistant\cli\Translate.ahk" --test "Hello world" 2>&1

# Test the TranslateTest.ahk script (simpler, no UIA library)
"C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" "E:\Code\EnglishAssistant\cli\TranslateTest.ahk"
```

**Note**:
- The `.ahk` file must be run with AutoHotkey64.exe, not directly from bash/shell
- Use `//ErrorStdOut` flag to see syntax errors in stderr
- Append `2>&1` to redirect stderr to stdout for debugging

### AHK Development Rule
**IMPORTANT**: After editing any `.ahk` file, you MUST run a syntax test to verify there are no errors. AutoHotkey syntax errors can only be caught by running the script with the interpreter - static analysis won't find them.

```bash
# Always run this test after editing Translate.ahk
"C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" //ErrorStdOut "E:\Code\EnglishAssistant\cli\Translate.ahk" --test "test" 2>&1
```

Common AHK v2 syntax pitfalls:
- Use `""` for literal quotes inside strings, not `\"`
- Declare `global` variables in functions that modify them
- Use `:=` for assignment, `=` for legacy v1 syntax (not supported in v2)

### AHK Command Line Options
- `--test "<text>"` - Test with specific text (bypasses UIA, outputs to stdout)
- `--select-all` - Send Ctrl+A before capturing text (useful for text boxes)

### AHK GUI Behavior
- **Theme**: Light theme with white background (#FFFFFF) and dark text (#202020)
- **Window Sizing**: Adapts to content (max 120 chars/line, max 960px width; max 600px height)
- **Dismissal**: Press ESC key or click middle mouse button to close the popup
- **Loading**: Animated "Translating..." indicator shows while processing
