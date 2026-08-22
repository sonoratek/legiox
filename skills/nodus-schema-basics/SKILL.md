---
name: nodus-schema-basics
description: Validate and read LegioX truth lens NODUS JSON. Use when authoring or auditing .nodus.json files.
---

# NODUS Schema Basics

## Required keys

schema_version, agent_type, name, mission (exactly primary_objective, context, target_outcome, scope), truth_lens, consult_when (≥3), key_patterns (≥2), expertise, keywords (≥3), priority, status.

## Instructions

1. `jq -r 'keys[]' file.nodus.json`
2. `jq '.mission | keys' file.nodus.json` — four keys only
3. Run `legiox-validate-schema { target: "agents" }` for index cross-check
