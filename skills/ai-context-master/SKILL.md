---
name: ai-context-master
description: "updating AI-CONTEXT"
disable-model-invocation: true
---
# AI Context Master

## Summary

The LegioX Context Engine is an MCP-integrated semantic search with specific APIs (legioxUpdateContext, legioxSelectAgent, legioxQuery) that must be called in exact workflows after every implementation. Not a generic knowledge base.

## Instructions

1. 7-step context update workflow
2. legioxUpdateContext() with structured facts/patterns/relationships
3. Knowledge gap identification via performance monitor

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ai-context-master.nodus.json"`
