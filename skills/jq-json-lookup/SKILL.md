---
name: jq-json-lookup
description: Fast JSON recon with jq before opening large JSON files. Use for AI-CONTEXT and NODUS files.
---

# jq JSON Lookup

## Instructions

1. Top-level keys: `jq -r 'keys[]' "<file>"`
2. Nested: `jq -r '.section | keys[]' "<file>"`
3. Value: `jq -r '.section.key' "<file>"`
4. Never use ripgrep `--keys` — jq only for JSON key discovery
