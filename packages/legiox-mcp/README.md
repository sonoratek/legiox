# @ringdom/legiox-mcp

LegioX MCP server — installable via npx, no local bundle required. Searches and mutates a **filesystem JSON knowledge base** (`AI-CONTEXT/`): concepts, implementations, patterns, workflows, troubleshooting. No Postgres, no SQLite, no cloud needed.

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

## Resources

`legiox-lens://<agent_type>` — every bundled truth lens is attachable as an @-menu resource.

## Publishing

See `../../NPM-PUBLISH.md` for the maintainer publication checklist.