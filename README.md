# LegioX Free — 147 skillsets for Cursor, OpenCode & VS Code

> Grow a searchable knowledge ecosystem: concepts, patterns & implementations with merge/append context (zero data loss). Auto-select the right skillset per task, generate new skillsets via `/legiox-create`, and rely on a built-in business advisor. **Freedom of Evolution for DIY founders.**

LegioX Free 1.1.0 is a 147-skill Cursor plugin for **Cursor**, **OpenCode**, and **VS Code**: the 10 library skills below, plus 137 corpus skills in `skills/`. It installs `legiox-mcp` into your workspace — no database, no cloud, no account. Your knowledge stays in your repo as JSON. Plugin version 1.1.0 replaces the earlier skew (tag 1.0.2, previous `main` 1.0.1). The npm package `@ringdom/legiox-mcp` remains the MCP server only.

## What you get

| # | Skillset | What it does |
|---|----------|--------------|
| 1 | `legiox-oath` | Verification-first workflow: jq → knowledge → selector → file-info → merge/append |
| 2 | `jq-json-lookup` | Fast JSON recon before opening large files |
| 3 | `nodus-schema-basics` | NODUS truth-lens schema: read, validate, author `.nodus.json` agents |
| 4 | `ring-platform-baseline` | Ring Platform stack baseline (Next.js 16 / React 19 / Auth.js v5 / PostgreSQL JSONB) |
| 5 | `legiox-file-info-verify` | Verify paths exist before read/edit — zero path assumptions |
| 6 | `legiox-knowledge` | **Knowledge ecosystem**: search, CRUD, merge/append context-update, cross-scans — machine-first JSON operating contract |
| 7 | `legiox-agent-selector-workflow` | Route tasks to the best truth lens by term matching |
| 8 | `mcp-server-id-mapping` | Correct MCP call envelope (`project-0-<workspace>-legiox-mcp`, not the mcp.json key) |
| 9 | `legiox-create` | **Generate your own skillsets**: `/legiox-create` → research → NODUS draft → validate → store → reindex |
| 10 | `legiox-business-intelligence` | AARRR growth model, KPIs, revenue forecasting, cohort analysis — a faithful business advisor for your project |

## How it works

- **Knowledge is filesystem JSON.** `legiox-knowledge` scores searches across your workspace `AI-CONTEXT` (ripgrep + jq index). No Postgres, no SQLite.
- **`legiox-context-update` merges, never replaces.** New facts append; overwrites require listing every dropped fact and your confirmation. Zero silent data loss.
- **Bootloader auto-installs** thinking patterns into `.cursor/rules/`, `.opencode/agent/`, and `.vscode/` on first workspace open — the agent learns to prefer `legiox-agent-selector` on matching terms and treats you as a founder/niche owner.
- **Grow your library.** Recurring task class? Run `/legiox-create` and get a schema-adherent NODUS skillset, stored and reindexed so the selector finds it next time.

## Install

### Cursor (marketplace / local)

```bash
# From this repo. Copy. Cursor skips a symlink that points outside ~/.cursor/plugins/local.
mkdir -p ~/.cursor/plugins/local
rm -rf ~/.cursor/plugins/local/legiox-free
cp -R . ~/.cursor/plugins/local/legiox-free
```

Then Developer: Reload Window. Approve **legiox-mcp** in Customize. The server cwd is `${CURSOR_PLUGIN_ROOT}`. Invoke a skill with `/skill-name`.

### OpenCode

Copy `.opencode/` contents into your project, or add the `legiox-mcp` server to `opencode.json`:

```json
{
  "mcp": {
    "legiox-mcp": {
      "type": "local",
      "command": ["node", "/abs/path/to/legiox/mcp/AI-LEGIOX/legiox-mcp/legiox-mcp-server.js"],
      "enabled": true,
      "env": {
        "LEGIOX_FILE_INFO_BACKEND": "filesystem"
      }
    }
  }
}
```

### VS Code

Install `legiox-vscode-*.vsix` from [Releases](https://github.com/sonoratek/legiox/releases) (Extensions → … → Install from VSIX), or add `.vscode/legiox-copilot-instructions.md` manually.

## Redistributables

| IDE | Artifact | Contents |
|-----|----------|----------|
| Cursor | `legiox-free-<version>.zip` | Full plugin incl. bundled `legiox-mcp` + SDK |
| OpenCode | `legiox-opencode-<version>.zip` | `.opencode/` agent + skills + `opencode.json` snippet |
| VS Code | `legiox-vscode-<version>.vsix` | Minimal extension shipping Copilot instructions |

## Build from source

```bash
node AI-LEGIOX/scripts/pack-legiox-plugins.mjs   # in the ringdom monorepo — regenerates legiox-free/
```

## License

MIT — see [LICENSE](LICENSE).