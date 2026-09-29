---
name: ai-voice-dubbing-orchestrator
description: Need deterministic AI narration for structured technical video scenes. Need multilingual dubbing with terminology-safe translation memory. Need word timestamps and subtitle sync from generated TTS audio. Need pronunciation control for NODUS LegioX jq arXiv ASN.1 terms. LegioX truth lens skill.
---

# AI Voice Dubbing Orchestrator (NODUS)

## Summary

Treat script_json_schema scenes as immutable contract input and produce audio artifacts as orchestration outputs, never as script rewrites. For each scene, prioritize deterministic idempotency and timing observability: synthesize narration, capture word-level timing (native provider timestamps when available, otherwise forced alignment), validate target duration against scene.duration_seconds, and emit standardized artifact paths consumed by render_manifest_v1. Preserve technical truth by enforcing a canonical Ringdom lexicon before synthesis and by pinning glossary-aware translation in dub flows. Prefer per-scene wav stems for editability, then derive global narration, subtitles, and final masters via FFmpeg chains with loudness normalization and sidechain ducking. In failures, classify by rate limit, transient provider fault, or policy block; retry with controlled backoff; then route to fallback providers without losing voice profile intent. Avoid hidden magic: every decision (provider, model, retry, duration fit, cost estimate) must be auditably logged for Commander dashboards and reproducible batch rendering.

## When to use

- Need deterministic AI narration for structured technical video scenes
- Need multilingual dubbing with terminology-safe translation memory
- Need word timestamps and subtitle sync from generated TTS audio
- Need pronunciation control for NODUS LegioX jq arXiv ASN.1 terms
- Need FFmpeg mastering chain for voice over + music video mix
- Need retry and fallback policy for 429 5xx content policy blocks
- Need provider routing by quality latency and budget constraints
- Need artifacts compatible with render_manifest_v1 mux workflow

## Instructions

1. Pattern: compile one VoiceSynthesisJob per scene and language before API calls -> idempotent retries and reproducible outputs.
2. Pattern: apply canonical glossary and pronunciation lexicon pre-synthesis -> stable technical term accuracy across locales.
3. Pattern: request native timestamps when provider supports them, else run forced alignment pass -> consistent word timing JSON.
4. Pattern: enforce target_duration_seconds tolerance window before mastering -> prevents late mux-stage sync drift.
5. Pattern: generate per-scene wav stems first, then global aggregates -> enables surgical re-render without full batch rerun.
6. Pattern: on 429 use exponential backoff with jitter and quota-aware concurrency caps -> avoids cascading provider throttling.
7. Pattern: on repeated 5xx switch to fallback provider with same style_profile mapping -> keeps pipeline moving under outages.
8. Pattern: when content policy blocks appear, redact/transform risky segment only and re-submit -> minimizes collateral rerenders.
9. Pattern: normalize loudness after mixing, not before all processing -> preserves dynamic integrity and target LUFS compliance.
10. Pattern: emit manifest-linked artifact paths immediately after each completed scene -> downstream mux can stream partial progress.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://ai_voice_dubbing_orchestrator`).
