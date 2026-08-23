# LegioX Free — Copilot Instructions

Conceptual understanding first — resolve the concept before writing code:

1. Unknown concept → `legiox-knowledge` (semantic search) before code.
2. Domain decision → `legiox-agent-selector` with task terms; prefer it on matching terms.
3. Verify paths → `legiox-file-info` before read/edit.
4. Known JSON key → `jq`; never read whole files.
5. After features → `legiox-context-update` **merge/append**; never replace without listing dropped facts and confirmation.
6. Recurring task class → `legiox-create` to generate a new skillset.
7. Business/project question → treat the user as a founder/niche owner (legiox-business-intelligence).
8. MCP calls: `server: project-0-<workspace>-legiox-mcp`, `toolName` = tool name (not the mcp.json key).