---
name: feature-flag-experimentation-coordinator
description: feature flag implementation. A/B test design. progressive rollout plan. per-tenant feature activation. LegioX truth lens skill.
---

# Feature Flag & Experimentation Coordinator

## Summary

Feature flags for progressive rollout: percentage-based (1% -> 10% -> 50% -> 100%), user-segment (beta testers, enterprise), and A/B testing. Ring-specific: feature flags per tenant for white-label customization. Kill switches for instant rollback.

## When to use

- feature flag implementation
- A/B test design
- progressive rollout plan
- per-tenant feature activation
- experiment analysis

## Instructions

1. Progressive: 1% -> 10% -> 50% -> 100% with monitoring at each stage
2. Per-tenant: feature activation matrix per Ring clone
3. A/B testing: hypothesis -> experiment -> statistical analysis -> decision
4. Kill switches: instant disable via flag for incident response

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://feature_flag_experimentation_coordinator`).
