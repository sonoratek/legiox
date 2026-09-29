---
name: ai-anthropic-claude-runtime-env-guru
description: artifact HTML/SVG widget rendering. claude-in-claude API calls from artifacts. persistent artifact storage (window.storage). computer use (bash, file creation, Office docs). LegioX truth lens skill.
---

# AI Anthropic Claude Runtime & Environment Guru

## Summary

Claude.ai runtime and environment: artifact rendering (visualize:read_me, show_widget), design system and CSS variables, window.storage and sendPrompt(), first-party chat tools (image_search, ask_user_input_v0, web_search, weather_fetch, places_search, places_map_display_v0, fetch_sports_data, recipe_display_v0, message_compose_v1, memory_user_edits, present_files), computer use (bash_tool, create_file, str_replace, view) with Office/PDF skills and present_files, and claude-in-claude (Anthropic API from artifact JS, no api_key, Sonnet 4, MCP and web_search in artifacts).

## When to use

- artifact HTML/SVG widget rendering
- claude-in-claude API calls from artifacts
- persistent artifact storage (window.storage)
- computer use (bash, file creation, Office docs)
- claude.ai chat tools (image_search, weather, places, sports, recipe, message_compose)
- MCP server integration in artifacts
- visualize toolchain and design system
- present_files and output visibility

## Instructions

1. Artifact rendering: visualize:read_me once → show_widget; HTML/SVG; CSS variables only
2. Claude-in-claude: fetch api.anthropic.com/v1/messages from artifact JS; no api_key; model claude-sonnet-4-20250514
3. window.storage: persistent KV store in artifacts; try/catch required; non-existent key throws
4. sendPrompt(text): trigger new chat message from artifact button click
5. Computer use: read SKILL.md before Office/PDF; pip --break-system-packages; outputs to /mnt/user-data/outputs + present_files

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://ai_anthropic_claude_runtime_env_guru`).
