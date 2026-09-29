---
name: mcp-server-id-mapping
description: "wire plugin mcp.json for legiox-free or legiox-pro"
disable-model-invocation: true
---
# MCP Server ID Mapping

## Summary

Plugin mcp.json uses an mcpServers object. Cursor Plugins infer stdio from command and HTTP from url. Expand ${CURSOR_PLUGIN_ROOT} and ${CLAUDE_PLUGIN_ROOT} in command, args, env, and cwd. Cursor does not expand ${PLUGIN_ROOT} or ${PLUGIN_DATA}. Declare user tokens with the plugin.json variables JSON Schema and substitute ${VAR}; never commit secret values. Toggle servers in Customize; a disabled server does not load. Deeplink: cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64_ENCODED_CONFIG. The mcp.json key legiox-mcp is not the CallMcpTool server id. A workspace registration is project-0-ringdom-legiox-mcp. A plugin install registers as plugin-<plugin-name>-legiox-mcp (the June install was plugin-legiox-premium-legiox-mcp). Read the tool descriptor before calling. Both free and pro ship the bundled server. npm @ringdom/legiox-mcp (1.0.3) is the MCP package only, invoked as npx -y @ringdom/legiox-mcp, and is not the skill plugin. reggie-mcp stays optional and local; it is not part of the public free listing.

## Instructions

1. Pattern: mcp.json command node with cwd ${CURSOR_PLUGIN_ROOT} and args pointing at the bundled server
2. Pattern: do not write ${PLUGIN_ROOT}; Cursor will not expand it
3. Pattern: Customize toggle enables or disables the server; first run still needs user approval
4. Pattern: plugin server id is plugin-legiox-free-legiox-mcp or plugin-legiox-pro-legiox-mcp
5. Pattern: npx -y @ringdom/legiox-mcp is the published MCP slice, version 1.0.3
6. Pattern: variables schema in plugin.json for every ${VAR} placeholder
7. Pattern: free and pro both ship MCP; community-without-MCP is retired
8. Pattern: beforeMCPExecution may audit tool names; do not exfiltrate file contents

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/cursor-mcp-plugin-integration-specialist.nodus.json"`
