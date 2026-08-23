# @ringdom/legiox-mcp

LegioX MCP server — **free tier**. Installable via npx, no local bundle required. Searches and mutates a **filesystem JSON knowledge base** (`AI-CONTEXT/`): concepts, implementations, patterns, workflows, troubleshooting. No Postgres, no SQLite, no cloud needed.

## Quick start

```bash
npx -y @ringdom/legiox-mcp --test          # health check
```

Connect from any MCP client (Claude Desktop, Cursor, OpenCode, VS Code):

```json
{
  "mcpServers": {
    "legiox-mcp": {
      "command": "npx",
      "args": ["-y", "@ringdom/legiox-mcp"],
      "env": {
        "RINGDOM_ROOT": "/abs/path/to/workspace",
        "LEGIOX_FILE_INFO_BACKEND": "filesystem"
      }
    }
  }
}
```

- `RINGDOM_ROOT` — the workspace containing your `AI-CONTEXT/` knowledge base (defaults to cwd).
- `LEGIOX_FILE_INFO_BACKEND=filesystem` — no database required.

## Tools

| Tool | Purpose |
|------|---------|
| `legiox-knowledge` | Score-based semantic search over your AI-CONTEXT corpus |
| `legiox-context-update` | Merge/append knowledge — **never replaces** without confirmation |
| `legiox-agent-selector` | Route tasks to the best truth lens by term matching |
| `legiox-create-nodus` | Generate schema-adherent NODUS skillsets |
| `legiox-file-info` | Verify paths before read/edit |
| `legiox-validate-schema` | Validate AI-CONTEXT docs and truth-lens agents |
| `legiox-kingdom-grep` / `legiox-codebase-grep` | Cross-scans over knowledge/code |
| `legiox-agent-index-rebuilder` | Reindex after adding truth lenses |

## Corpus

The free tier ships **starter content only**: `agent-schema.json`, `AGENT-NODUS-SCHEMA.md`, and two starter truth lenses (`react-19-specialist`, `cursor-mcp-plugin-integration-specialist`). The full premium truth-lens library (369+ lenses) is available via the hosted LegioX Pro offering.

## Publishing

See `../../NPM-PUBLISH.md` for the maintainer publication checklist.