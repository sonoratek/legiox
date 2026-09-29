---
name: cursor-plugin-architect-guru
description: scaffold or repair the LegioX Cursor plugin tree. plugin.json or marketplace.json schema questions. skills or rules not loading after a manifest path override. Agent Plugin versus Cursor Plugin format choice. LegioX truth lens skill.
---

# Cursor Plugin Architect Guru

## Summary

A LegioX Cursor Plugin is a directory with .cursor-plugin/plugin.json. Required field is name: lowercase kebab-case, alphanumerics, hyphens, and periods, starting and ending with an alphanumeric. Optional fields include description, version, author, homepage, repository, license, keywords, logo, and component paths. If skills, rules, agents, commands, hooks, or mcpServers is set, that path replaces default folder discovery; the default folder is not also scanned. Defaults: skills/*/SKILL.md (name must match the parent folder), rules as .md/.mdc/.markdown, agents as .md/.mdc/.markdown, commands as .md/.mdc/.markdown/.txt, hooks/hooks.json, root mcp.json. A root SKILL.md is a single-skill plugin only when there is no skills/ directory and no skills field. Multi-plugin repos put .cursor-plugin/marketplace.json at the repo root; the file must be 10 MB or smaller; per-plugin manifest wins on merge. Paths are relative: no .. and no absolute paths. Logo is a committed relative path such as assets/logo.svg. Local test copies the directory into ~/.cursor/plugins/local/<name> and reloads; symlinks that point outside that folder are skipped. LegioX names are legiox-free and legiox-pro. community and premium are deprecated and must not appear in marketplace.json. variables is a JSON Schema for user-supplied tokens; never commit secret values; substitute ${VAR} only. In mcp.json expand ${CURSOR_PLUGIN_ROOT}. Cursor does not expand ${PLUGIN_ROOT} or ${PLUGIN_DATA}. Public marketplace submission of this multi-plugin folder would index every plugin in marketplace.json, so the public submit repo is the free tree alone.

## When to use

- scaffold or repair the LegioX Cursor plugin tree
- plugin.json or marketplace.json schema questions
- skills or rules not loading after a manifest path override
- Agent Plugin versus Cursor Plugin format choice
- local test via copy into ~/.cursor/plugins/local
- map NODUS lenses into skills without dropping the MCP bundle

## Instructions

1. Pattern: .cursor-plugin/plugin.json name legiox-free or legiox-pro -> Cursor Plugin format
2. Pattern: marketplace.json plugins[] lists only legiox-free and legiox-pro
3. Pattern: manifest skills path replaces skills/ discovery; do not set both expecting a union
4. Pattern: cp -R into ~/.cursor/plugins/local/<name> then Developer: Reload Window
5. Pattern: SKILL.md frontmatter name matches the parent folder; rules and agents need frontmatter too
6. Pattern: logo assets/logo.svg is the real mark, never the 279-byte packer placeholder
7. Pattern: ${CURSOR_PLUGIN_ROOT} in mcp.json command, args, env, and cwd
8. Pattern: public Git submit is the free repo root; pro stays a downloadable archive

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://cursor_plugin_architect_guru`).
