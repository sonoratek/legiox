---
name: legiox-knowledge
description: Machine-first operations over the LegioX knowledge ecosystem: search, CRUD, merge/append context-update, and cross-scans. Use for every knowledge interaction.
---

# LegioX Knowledge Ecosystem

## Summary

The LegioX knowledge ecosystem is a filesystem JSON library (no database required): concepts, implementations, patterns, workflows, troubleshooting, features, services. Search via `legiox-knowledge` (semantic scoring over AI-CONTEXT), mutate via `legiox-context-update` (merge/append only), cross-scan via jq/ripgrep.

## Machine-first operating contract

```json
{
  "search": {
    "tool": "legiox-knowledge",
    "args": { "query": "<terms>", "context": "<project|domain>" },
    "read_first": ["path", "confidence", "score"],
    "fallback": "jq -r 'keys[]' <file> when path is already known",
    "compaction": "return concept + path + top quick_answers; never dump whole files"
  },
  "read": {
    "rule": "jq before Read for JSON; legiox-file-info before unknown paths",
    "patterns": ["jq -r '.facts[]' <concept.json>", "jq -r 'keys[]' <file>"]
  },
  "create": {
    "location": "AI-CONTEXT/<project>/<class>/<slug>-<YYYY-MM-DD>.json",
    "classes": ["concepts", "implementations", "patterns", "workflows", "troubleshooting", "features", "services"],
    "schema": "one class rubric from legiox-validate-schema { target: "knowledge" }"
  },
  "update": {
    "tool": "legiox-context-update",
    "mode": "merge",
    "rule": "append only unique facts/patterns/relationships; never re-send whole documents",
    "replace_rule": "mode=replace requires confirm_replace=true AND listing every dropped fact for explicit confirmation",
    "removal": "drop now-false facts only after the user confirms the exact strings"
  },
  "cross_scan": {
    "tool": "legiox-kingdom-grep or rg",
    "pattern": "rg "<term>" AI-CONTEXT --glob '*.json'",
    "filter": "jq -r 'select(.keywords[]? | contains("<area>"))' or area-aware globs"
  },
  "index": {
    "reindex": "legiox-agent-index-rebuilder after adding lenses",
    "cohorts": "sync-legiox-cohorts-index.mjs runs automatically after reindex"
  }
}
```

## Instructions

1. `legiox-knowledge { query: "...", context?: "project" }` — search first, always.
2. Read `path` + `confidence` before opening files; prefer `jq` over full reads.
3. Create: place new docs under the matching AI-CONTEXT class dir; follow that class rubric.
4. Update: `legiox-context-update` default `mode=merge` appends unique strings. Never `mode=replace` without listing every fact that would be dropped and awaiting confirmation.
5. Cross-scan: `legiox-kingdom-grep` / `rg` + `jq` filters to slice a layer by area or parameter.
6. Compose compacted results: concept, path, score, quick answers — not full document dumps.
