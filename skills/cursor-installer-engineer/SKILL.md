---
name: cursor-installer-engineer
description: "install legiox-free or legiox-pro on a Mac"
disable-model-invocation: true
---
# LegioX Cursor Installer Engineer

## Summary

Current LegioX install is a Cursor Plugin copy, not a symlink and not a monorepo workspace dump. Put each plugin at ~/.cursor/plugins/local/<name> by copying the directory (cp -R). Cursor skips a symlink whose target resolves outside that folder. Then run Developer: Reload Window and confirm skills, rules, and MCP in Customize. On Teams and Enterprise, Allow Local Plugin Imports lives under Dashboard -> Settings -> Security & Identity -> Marketplace and Plugins; it is off by default on Enterprise. A marketplace plugin with the same name takes precedence over the local copy. Ship legiox-free and legiox-pro only. Remove legiox-community and legiox-premium from ~/.cursor/plugins/local so Cursor does not keep the June community/premium installs. Public marketplace submit is a separate step owned by cursor_marketplace_publisher_guru and is free-only. Pro is this same local copy, or a downloadable zip extracted into that folder. Do not use ${PLUGIN_ROOT}; MCP paths use ${CURSOR_PLUGIN_ROOT}.

## Instructions

1. Pattern: rm -rf ~/.cursor/plugins/local/legiox-community ~/.cursor/plugins/local/legiox-premium before installing the current pair
2. Pattern: cp -R legiox-free ~/.cursor/plugins/local/legiox-free and the same for legiox-pro -> Reload Window
3. Pattern: symlink whose target is outside ~/.cursor/plugins/local -> Cursor skips it; use a real copy
4. Pattern: Customize sidebar -> confirm skills, rules, and legiox-mcp for both plugins
5. Pattern: marketplace install of the same name wins over the local folder
6. Pattern: Enterprise local imports require Allow Local Plugin Imports
7. Pattern: pro paid install is the zip extracted into ~/.cursor/plugins/local/legiox-pro, not a public marketplace listing
8. Pattern: do not point Cursor at the June 5 community/premium trees

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/cursor-installer-engineer.nodus.json"`
