---
name: mcp-server-id-mapping
description: add MCP server to Cursor plugin. generate MCP install deeplink for LegioX. CallMcpTool server id mismatch legiox-mcp vs project-0-ringdom-legiox-mcp. MCP server disabled or not loading from plugin. LegioX truth lens skill.
---

# MCP Server ID Mapping

## Summary

Plugin `mcp.json` uses `mcpServers` object with command/args/env per server—same shape as workspace `.cursor/mcp.json`. MCP Apps deeplink: cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64_ENCODED_CONFIG (see cursor.com/docs/mcp/install-links.md). Users toggle servers in Settings -> Features -> Model Context Protocol. CRITICAL LegioX rule: mcp.json key `legiox-mcp` is NOT CallMcpTool server—runtime id is `project-0-ringdom-legiox-mcp` from Cursor MCP registration (verify SERVER_METADATA.json under ~/.cursor/projects/*/mcps/). Always read tool descriptor JSON before CallMcpTool. Premium plugin ships legiox-mcp; reggie-mcp optional; community plugin must not require paid MCP. Use beforeMCPExecution hook to block destructive patterns if needed. Never commit API keys—document LEGIOX_* env vars in README.

## When to use

- add MCP server to Cursor plugin
- generate MCP install deeplink for LegioX
- CallMcpTool server id mismatch legiox-mcp vs project-0-ringdom-legiox-mcp
- MCP server disabled or not loading from plugin
- premium vs community MCP tier gating
- hook beforeMCPExecution or afterMCPExecution

## Instructions

1. Pattern: plugin root mcp.json with legiox-mcp stdio entry -> auto-load on plugin install
2. Pattern: read mcps/*/tools/*.json schema before CallMcpTool -> avoid payload errors
3. Pattern: server project-0-ringdom-legiox-mcp toolName legiox-knowledge -> correct MCP invocation
4. Pattern: deeplink share for onboarding -> base64 encode mcpServers fragment only
5. Pattern: premium README lists required env vars -> user sets in Cursor MCP settings
6. Pattern: community plugin omits mcp.json -> skills teach jq/rg without MCP dependency
7. Pattern: health check spawn node legiox-mcp-server.js --test in packager CI
8. Pattern: merge not replace user global mcp.json when using installer alongside plugin

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://cursor_mcp_plugin_integration_specialist`).
