---
name: ai-voice-audio-production-guru
description: "Need to choose AI voice provider for long-form technical narration quality and stability"
disable-model-invocation: true
---
# AI Voice & Audio Production Guru (NODUS)

## Summary

Treat audio as a contract-governed production system, not a decorative afterthought. Convert script intent into explicit narration direction presets, synthesize with provider-specific controls, normalize technical pronunciations, and package immutable stem artifacts before any destructive processing. Keep multilingual dubbing internals delegated to ai-voice-dubbing-orchestrator; this lens defines quality standards, performance direction constraints, rights governance, mastering profiles, and acceptance gates applied to primary and dubbed assets equally. Use two-pass loudness measurement, deterministic ducking, click-safe transitions, and platform-specific output specs to ensure intelligibility on mobile-first playback while preserving cinematic identity for long-form. Never ship without rights provenance, checksum integrity, and blocker-level QC pass. When costs or provider stability drift, route by declared strategy (high_quality, balanced, low_cost, low_latency) with auditable retry/fallback behavior and cache-safe stem reuse.

## Instructions

1. Pattern: lock narration style preset before synthesis -> consistent voice pacing and emphasis across all scenes.
2. Pattern: normalize acronym and symbol pronunciations pre-render -> fewer technical term errors in output speech.
3. Pattern: render immutable scene stems before mastering -> enables surgical rerender without full pipeline rebuild.
4. Pattern: run loudness two-pass measurement then apply correction -> predictable LUFS and true-peak compliance.
5. Pattern: apply sidechain ducking from voice stem to music stem -> improved intelligibility under background score.
6. Pattern: enforce rights manifest presence for every music/SFX asset -> auditable licensing compliance at publish time.
7. Pattern: classify QC findings as blocker warning informational -> deterministic go/no-go decisions for release.
8. Pattern: route provider by strategy profile and health score -> stable quality-cost-latency tradeoff under load.
9. Pattern: reuse cached stems when script hash and voice profile unchanged -> lower spend and faster batch turnaround.
10. Pattern: pass audio_profile_id mastering_profile_id rights_manifest_uri qc_report_uri to downstream -> frictionless final mux assembly.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ai-voice-audio-production-guru.nodus.json"`
