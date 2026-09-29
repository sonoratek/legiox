---
name: legiox-agent-selector-workflow
description: "Route one task to one LegioX lens with legiox-agent-selector, then jq that nodus file. Use before architecture or domain work."
---
# LegioX Agent Selector

## Instructions

1. Call `legiox-agent-selector` with the task terms. Read `selectedAgent` and `selectedAgentFile`.
2. Read that one lens from the plugin bundle. Do not open the skill catalog.
   `jq -r '.truth_lens, .key_patterns[]' "mcp/AI-LEGIOX/legiox-truth-lens/<file>.nodus.json"`
3. Follow that lens. Type `/<slug>` only for the one skill this message will apply.
4. Known JSON path → `jq`. Unknown concept → `legiox-knowledge`. Uncertain path → `legiox-file-info`.

Corpus skills set `disable-model-invocation: true`. Their descriptions stay out of the prompt until named.
