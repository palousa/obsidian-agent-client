<h1 align="center">Agent Client Plugin for Obsidian</h1>

<p align="center">
  <img src="https://img.shields.io/github/downloads/RAIT-09/obsidian-agent-client/total" alt="GitHub Downloads">
  <img src="https://img.shields.io/github/license/RAIT-09/obsidian-agent-client" alt="License">
  <img src="https://img.shields.io/github/v/release/RAIT-09/obsidian-agent-client" alt="GitHub release">
  <img src="https://img.shields.io/github/last-commit/RAIT-09/obsidian-agent-client" alt="GitHub last commit">
  <a href="https://github.com/RAIT-09/obsidian-agent-client/discussions"><img src="https://img.shields.io/github/discussions/RAIT-09/obsidian-agent-client" alt="GitHub Discussions"></a>
</p>

<p align="center">
  <a href="README.ja.md">日本語はこちら</a>
</p>

<p align="center">
  <a href="https://www.buymeacoffee.com/rait09" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="180" height="50" ></a>
</p>

Bring AI agents (Claude Code, Codex, Gemini CLI) directly into Obsidian. Chat with your AI assistant right from your vault.

Built on [Agent Client Protocol (ACP)](https://github.com/zed-industries/agent-client-protocol) by Zed.

https://github.com/user-attachments/assets/1c538349-b3fb-44dd-a163-7331cbca7824

## Features

- **Note Mentions**: Reference your notes with `@notename` syntax
- **Image Attachments**: Paste or drag-and-drop images into the chat
- **Slash Commands**: Use `/` commands provided by your agent
- **Multi-Agent Support**: Switch between Claude Code, Codex, Gemini CLI, and custom agents
- **Multi-Session**: Run multiple agents simultaneously in separate views
- **Floating Chat**: A persistent, collapsible chat window for quick access
- **Mode & Model Switching**: Change AI models and agent modes from the chat
- **Session History**: Resume or fork previous conversations
- **Chat Export**: Save conversations as Markdown notes
- **Terminal Integration**: Let agents execute commands and return results

## Installation

### Via BRAT (Recommended)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Go to **Settings → BRAT → Add Beta Plugin**
3. Paste: `https://github.com/RAIT-09/obsidian-agent-client`
4. Enable **Agent Client** from the plugin list

### Manual Installation

1. Download `main.js`, `manifest.json`, `styles.css` from [Releases](https://github.com/RAIT-09/obsidian-agent-client/releases)
2. Place them in `VaultFolder/.obsidian/plugins/agent-client/`
3. Enable the plugin in **Settings → Community Plugins**

## Quick Start

Open a terminal (Terminal on macOS/Linux, PowerShell on Windows) and run the following commands.

1. **Install an agent and its ACP adapter** (e.g., Claude Code):
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash   # Install Claude Code
   npm install -g @zed-industries/claude-agent-acp   # Install ACP adapter
   ```

2. **Login** (skip if using API key):
   ```bash
   claude
   ```
   Follow the prompts to authenticate with your Anthropic account.

3. **Find the paths**:
   ```bash
   which node   # macOS/Linux
   which claude-agent-acp

   where.exe node   # Windows
   where.exe claude-agent-acp
   ```

4. **Configure** in **Settings → Agent Client**:
   - **Node.js path**: e.g., `/usr/local/bin/node`
   - **Built-in agents → Claude Code → Path**: e.g., `/usr/local/bin/claude-agent-acp` (not `claude`)
   - **API key**: Add your key, or leave empty if logged in via CLI

5. **Start chatting**: Click the robot icon in the ribbon

### Setup Guides

- [Claude Code](https://rait-09.github.io/obsidian-agent-client/agent-setup/claude-code.html)
- [Codex](https://rait-09.github.io/obsidian-agent-client/agent-setup/codex.html)
- [Gemini CLI](https://rait-09.github.io/obsidian-agent-client/agent-setup/gemini-cli.html)
- [Custom Agents](https://rait-09.github.io/obsidian-agent-client/agent-setup/custom-agents.html) (OpenCode, Qwen Code, Kiro, Mistral Vibe, etc.)

**[Full Documentation](https://rait-09.github.io/obsidian-agent-client/)**

## Fork Customizations (`erin/customizations`)

This fork adds features for proactive agentic experiences — an agent that checks in periodically, does background work, and maintains context across sessions.

### Heartbeat System (`src/shared/heartbeat-manager.ts`)

A timer-based system that periodically sends standing instructions (from a configurable vault file, e.g. `HEARTBEAT.md`) to a dedicated agent session. The agent can do silent work (read/write files, run tools) and surface messages inline when something needs attention.

- Configurable interval, active hours, and duplicate suppression
- Full settings UI panel (Settings → Agent Client → Heartbeat)
- Responses logged to a configurable vault file (e.g. `Heartbeat Log.md`)
- `HEARTBEAT_OK` sentinel for "nothing to report" ticks

### sendMessage Text Override

`sendMessage(text?: string)` accepts an optional text parameter that bypasses React input state. This allows programmatic message injection (e.g. from the heartbeat) without clearing the user's in-progress typing.

### Session Export API

`exportSession()` exposed on `IChatViewContainer` interface, callable from any part of the system — heartbeat, plugin lifecycle, timers. `exportAllSessions()` on the plugin fires automatically on unload so sessions aren't lost on restart.

### Chat UI Filtering

Heartbeat ticks (`[Heartbeat tick]`) and `HEARTBEAT_OK` responses are filtered from the chat UI. The heartbeat works silently; only substantive responses appear in the conversation.

### Timestamp Prepend

Injects current date/time into every prompt so the agent always knows when it is. Configurable via `prependDateTime` setting.

### Known Limitations & Roadmap

- **Logging is agent-reported, not code-enforced.** The heartbeat log relies on the agent self-reporting its actions. There's no independent verification that the log is complete or accurate. Planned: move logging to a code-level guarantee (like session export), so the audit trail doesn't depend on model compliance.
- **No structured observability.** Log entries are human-readable Markdown, not machine-parseable. Planned: structured, append-only log format designed for eventual OTEL integration and cryptographic verifiability (provenance).
- **No immutability guarantees.** The agent can currently edit or delete its own log entries. Planned: append-only enforcement at the file/system level.

## Development

```bash
npm install
npm run dev
```

For production builds:
```bash
npm run build
```

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=RAIT-09/obsidian-agent-client&type=Date)](https://www.star-history.com/#RAIT-09/obsidian-agent-client&Date)
