---
name: motion-graphics-data-visualization-guru
description: "Need deterministic JSON-to-animation schema for technical explainers"
disable-model-invocation: true
---
# Motion Graphics & Data Visualization Guru (NODUS)

## Summary

Motion graphics in technical education must be contract-driven, not taste-driven: scripts define semantic claims, this lens compiles them into typed visual primitives with explicit timing, source hashes, and idempotency keys, and downstream tooling renders only what can be verified. Use Remotion for deterministic code/diagram-heavy scenes and Lottie for lightweight reusable iconography; never allow cinematic effects to distort quantitative truth or technical semantics. Align every reveal to narration timestamps and subtitle-safe constraints, enforce anti-misleading chart blockers, and emit artifacts that postproduction can compose without manual timeline guesswork. The result is low-rework, pedagogically clear, and audit-ready technical storytelling where every animated claim can be traced to source data and script intent.

## Instructions

1. Pattern: map scene semantic_intent to explicit primitive types before rendering -> eliminates ambiguous animation implementation.
2. Pattern: lock fps and duration_frames from scene contract and voice timestamps -> guarantees frame-accurate narration sync.
3. Pattern: route code and schema fidelity scenes to Remotion or capture, not generative video -> preserves technical truth.
4. Pattern: treat axis truncation, hidden scale shifts, and area exaggeration as blockers -> prevents misleading metric storytelling.
5. Pattern: compile every composition with source_data_hash and idempotency_key -> enables deterministic reruns and cache reuse.
6. Pattern: cap concurrent animated channels to narration+text+one motion focus -> reduces cognitive overload for developer audiences.
7. Pattern: apply safe-area and contrast checks before export variants -> improves cross-platform readability and accessibility.
8. Pattern: emit per-composition json sidecar plus sha256 checksum -> strengthens postproduction provenance and reproducibility.
9. Pattern: perform selective CI rerenders only for changed composition dependencies -> lowers compute cost and feedback time.
10. Pattern: downgrade unsupported Lottie features via deterministic fallback matrix -> avoids runtime breakage across targets.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/motion-graphics-data-visualization-guru.nodus.json"`
