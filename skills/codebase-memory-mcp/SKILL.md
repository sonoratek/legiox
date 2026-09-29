---
name: codebase-memory-mcp
description: Does this module or function exist in ring/web. Who calls this API handler, or what does this service call. Is this route wired in the graph. What changed since the last doc revision. LegioX truth lens skill.
---

# Codebase Memory MCP

## Summary

Ring codebase-memory-mcp is structural truth for Layer1 at ring/web (project Users-insight-code-ringdom-ring-web, path /Users/insight/code/ringdom/ring/web). Related projects: Users-insight-code-ringdom-ring, Users-insight-code-ringdom-ring-platform-org-web, Users-insight-code-ringdom-ring-greenfood-live-web. Server id user-codebase-memory-mcp. CLI fallback: /Users/insight/code/ringdom/AI-RING/codebase-memory-mcp cli <tool> '<json>' and drop level= log lines. Docs loop is three layers: legiox-knowledge, then this graph (~500 tokens versus a large grep), then rg plus read on lib/, app/api/, env.local.template, and data/schema.sql. search_code finds a module. search_graph then get_code_snippet gives symbol and file. trace_path inbound or outbound needs an exact function_name. Route wiring is search_graph on Route. detect_changes maps a git ref or since-date to affected symbols. Index is stale if the DB mtime is over 3 days or today's commits are missing: index_repository full on ring/web, then restart MCP because the in-memory cache lags disk. Do not treat the DeusData upstream README as the Ring binary's project ids.

## When to use

- Does this module or function exist in ring/web
- Who calls this API handler, or what does this service call
- Is this route wired in the graph
- What changed since the last doc revision
- Index may be stale and a structural claim must not be invented

## Instructions

1. list_projects before any project id. Layer1 id is Users-insight-code-ringdom-ring-web for /Users/insight/code/ringdom/ring/web.
2. Existence: search_code {"pattern":"DatabaseService","project":"Users-insight-code-ringdom-ring-web","limit":10}. Alternation foo|bar needs regex true.
3. Symbol: search_graph name_pattern ".*getSharedPgPool.*" then get_code_snippet on the qualified_name.
4. Callers: trace_path {"function_name":"…","direction":"inbound","depth":3}. Outbound uses direction outbound. Exact name only.
5. Routes: search_graph name_pattern ".*Route.*" with label Route. HTTP edges: query_graph MATCH (a)-[r:HTTP_CALLS]->(b) RETURN … LIMIT 20.
6. Architecture: get_architecture {"aspects":["all"]}. Changes: detect_changes {"since":"YYYY-MM-DD"} or a git ref.
7. CLI: /Users/insight/code/ringdom/AI-RING/codebase-memory-mcp cli <tool> '<json>' 2>&1 | grep -v '^level='.
8. Stale index: DB mtime over 3 days or today's commits missing. index_repository full on /Users/insight/code/ringdom/ring/web, then restart MCP.
9. Dead-code or fan-in: search_graph with max_degree or min_degree. Useful for deprecated callouts, not for prose.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://codebase_memory_mcp`).
