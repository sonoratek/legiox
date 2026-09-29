---
name: legiox-plugin-packager-guru
description: build LegioX Cursor plugin from monorepo. cohort skill pack selection community vs premium. exclude internal nodus from public plugin. MCP server bundle size optimization. LegioX truth lens skill.
---

# LegioX Plugin Packager Guru

## Summary

Packager is ETL: Extract nodus JSON + rules + MCP from ringdom -> Transform to SKILL.md/rules/agents -> Load into legiox-cursor-plugins repo subdirs. Community tier: 5–10 skills from oath + platform baseline + nodus basics; no MCP binary. Premium: top-N lenses per cohort as skills (cap 80 skills initial release), legiox-mcp server path via npm package @ringdom/legiox-mcp or git submodule pointer, hooks optional. Use .reggie-propagate-exclude.json pattern for plugin-build-exclude.json listing nodus files too large or internal-only (ua-hromada-delegate, commander locker). Version lock: marketplace plugin version semver aligns with LEGIOX_VERSION env. AI-AGENT-INDEX.json -> generate commands/legiox-select.md with top agents not full 1MB index. Run legiox-agent-index-rebuilder before pack. Health check spawn MCP in CI. Installer and plugin both valid: plugin for marketplace discovery, installer for air-gapped monorepo sync.

## When to use

- build LegioX Cursor plugin from monorepo
- cohort skill pack selection community vs premium
- exclude internal nodus from public plugin
- MCP server bundle size optimization
- version sync plugin and MCP
- installer vs plugin distribution strategy

## Instructions

1. Pattern: scripts/pack-legiox-plugins.mjs reads cohort matrix -> outputs legiox-community/ legiox-premium/
2. Pattern: plugin-build-exclude.json omits commander locker and internal UA lenses
3. Pattern: nodus truth_lens + key_patterns -> SKILL.md via template not raw JSON
4. Pattern: premium packages @ringdom/legiox-mcp npm dep -> mcp.json points to node_modules path
5. Pattern: checksums.json per release -> installer verification parity
6. Pattern: pack after legiox-agent-index-rebuilder -> index fresh
7. Pattern: cap premium skills at 80 v1 -> long tail stays MCP-only
8. Pattern: symlink pack output to ~/.cursor/plugins/local for smoke test

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://legiox_plugin_packager_guru`).
