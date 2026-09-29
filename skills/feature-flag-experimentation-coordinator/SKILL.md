---
name: feature-flag-experimentation-coordinator
description: "feature flag implementation"
disable-model-invocation: true
---
# Feature Flag & Experimentation Coordinator

## Summary

Feature flags for progressive rollout: percentage-based (1% -> 10% -> 50% -> 100%), user-segment (beta testers, enterprise), and A/B testing. Ring-specific: feature flags per tenant for white-label customization. Kill switches for instant rollback.

## Instructions

1. Progressive: 1% -> 10% -> 50% -> 100% with monitoring at each stage
2. Per-tenant: feature activation matrix per Ring clone
3. A/B testing: hypothesis -> experiment -> statistical analysis -> decision
4. Kill switches: instant disable via flag for incident response

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/feature-flag-experimentation-coordinator.nodus.json"`
