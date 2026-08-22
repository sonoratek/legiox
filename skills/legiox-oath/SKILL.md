---
name: legiox-oath
description: Verification-first workflow for LegioX Commander. Use before architecture, deploy, or production changes.
---

# LegioX Oath

## Instructions

1. Known JSON path → `jq -r '.key' file.json`
2. Unknown concept → `legiox-knowledge` MCP tool
3. Domain decision → `legiox-agent-selector` with task terms
4. Uncertain path → `legiox-file-info` before read/edit
5. After features → `legiox-context-update` (**merge/append**. Never replace an existing concept file unless the user confirms the facts that would be dropped.)
6. MCP calls: `server: project-0-<workspace>-legiox-mcp`, `toolName` = tool name (not `legiox-mcp`)
