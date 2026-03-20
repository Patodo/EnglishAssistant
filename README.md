# English Assistant

A personal English learning assistant with CLI translation and web history viewer.

## Features

- **CLI Translation**: Translate text via an OpenAI-compatible API with a simple command
- **Persistent Storage**: All translations are saved to a local SQLite database
- **Web History Viewer**: Browse your translation history in a kanban-style web interface
- **AutoHotkey Integration**: Windows-only CLI tool to translate selected text from any application

## Prerequisites

- Node.js (v22 or higher)
- npm or yarn
- An OpenAI-compatible API key
- **For AutoHotkey integration**: AutoHotkey v2.0+ (Windows only)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd EnglishAssistant
```

2. Install dependencies:
```bash
npm install
```

3. Install web dependencies:
```bash
cd web
npm install
cd ..
```

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
PORT=3000
```

## Usage

### CLI Translation

Translate text from the command line:

```bash
npm run cli "Hello world"
```

The translation will be output to stdout and saved to the database.

### Web Interface

Development mode (runs both API and Vite dev server):
```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

Production mode:
```bash
npm run build
npm run start
```

Then open http://localhost:3000 in your browser.

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/translations` - Get all translations

### NPM Scripts

- `npm run cli` - Run the CLI translation tool
- `npm run dev` - Start development servers (API + Vite)
- `npm run dev:api` - Start only the API server
- `npm run dev:web` - Start only the Vite dev server
- `npm run build` - Build the React app for production
- `npm run start` - Start the production server

## AHK Integration (Windows Only)

This project includes AutoHotkey v2.0 integration for seamless text translation from any Windows application.
Note that the AutoHotkey script is run once instead running in background.

### Features

- **CLI Invocation**: Run from any keyboard manager or launcher
- **UI Automation**: Captures selected text without using the clipboard
- **Borderless Popup**: Displays translation in a light-themed GUI at cursor position (max 120 characters per line)
- **ESC Key Dismissal**: Press ESC key or click middle mouse button to close the popup
- **Animated Loading**: Shows animated "Translating..." indicator while processing
- **Test Mode**: Built-in `--test` flag for testing without UIA
- **Select All**: Optional `--select-all` flag to auto-select all text before translating

### Prerequisites for AHK

1. **Install AutoHotkey v2.0**
   - Download from https://www.autohotkey.com/
   - Version 2.0+ is required

2. **Ensure Node.js is in PATH**
   - Run `node --version` to verify
   - Run `npm --version` to verify

### Usage

**Command Line Syntax**:
```bash
Translate.ahk [--test "<text>"] [--select-all]
```

**Options**:
- `--test "<text>"` - Test the script with specific text (bypasses UIA text capture)
- `--select-all` - Send Ctrl+A before capturing (selects all text in focused element)

**Examples**:

1. **Translate selected text** (bind this to a hotkey in your keyboard manager):
   ```bash
   "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" "E:\Code\EnglishAssistant\cli\Translate.ahk"
   ```

2. **Translate with auto-select all**:
   ```bash
   "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" "E:\Code\EnglishAssistant\cli\Translate.ahk" --select-all
   ```

3. **Test with specific text**:
   ```bash
   "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" "E:\Code\EnglishAssistant\cli\Translate.ahk" --test "Hello world"
   ```

**Workflow**:
1. Select text in any application (Notepad, browser, Word, etc.)
2. Run the script (via your keyboard manager's hotkey or launcher)
3. A popup appears showing the translation
4. Press ESC key or click middle mouse button to dismiss the popup

### Testing

**Test with --test flag**:
The easiest way to test is using the built-in `--test` flag:
```bash
"C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" "E:\Code\EnglishAssistant\cli\Translate.ahk" --test "Hello world"
```

**Test Script (alternate)**:
For testing without loading the full UIA library, use `cli/TranslateTest.ahk`:
- Run: `"C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" "E:\Code\EnglishAssistant\cli\TranslateTest.ahk"`
- This translates a hardcoded test phrase
- Useful for verifying Node.js, npm, and the CLI are working correctly

### Compatible Applications

The AHK script uses Windows UI Automation (UIA) and works with:

- **Text Editors**: Notepad, Notepad++, Wordpad, VS Code
- **Browsers**: Chrome, Edge, Firefox
- **Office Apps**: Microsoft Word, Excel, PowerPoint
- **Modern Windows Apps**: Most UWP applications with UIA support

### Troubleshooting

**"Node.js/npm not found"**
- Install Node.js and ensure it's added to your system PATH
- Restart your terminal/command prompt after installation

**"No text detected"**
- Make sure text is actually selected (highlighted) in the application
- Some applications may not support UI Automation

**"No focused element found"**
- Click in the application first to ensure it has focus
- Try selecting text again

**Translation popup doesn't appear**
- Check that the script is running (look for the AutoHotkey icon in the system tray)
- Ensure Node.js dependencies are installed (`npm install`)

### CLI Interface for Custom Scripts

The CLI can also be called directly from other scripts:

```ahk
; Run the CLI and capture stdout
shell := ComObject("WScript.Shell")
exec := shell.Exec("npm run cli ""Your text here""")
output := exec.StdOut.ReadAll()

; Display the result
MsgBox(output)
```

### Exit Codes

- `0` - Success (translation output to stdout)
- `1` - Error (error message output to stdout)

## Database

The SQLite database is stored at `./database/english_assistant.db`.

### Schema

```sql
CREATE TABLE translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original TEXT NOT NULL,
    translated TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_translations_created_at
ON translations(created_at DESC);
```

## License

MIT
