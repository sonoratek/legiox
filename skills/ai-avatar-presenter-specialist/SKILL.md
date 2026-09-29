---
name: ai-avatar-presenter-specialist
description: Need avatar presenter videos from script plus approved voice stems. Need lip-sync drift correction for pre-generated TTS audio. Need multilingual avatar outputs EN UK PL with term locks. Need same presenter identity across episode series. LegioX truth lens skill.
---

# AI Avatar Presenter Specialist (NODUS)

## Summary

Treat presenter generation as strict contract execution: script scenes define semantic intent, voice stems define timing truth, and avatar APIs only realize visual delivery. Never rewrite narrative text in this stage; normalize and align it. Build one idempotent avatar render job per scene-language pair, lock provider payload hashes, and require measurable drift outputs before acceptance. For technical explainers, prioritize stability, eye-contact continuity, and subtitle consistency over exaggerated gestures. Use same-avatar multilingual strategy by default for brand continuity, then escalate to per-language profile only when intelligibility, mouth-shape accuracy, or localization trust demands it. Preserve alpha-safe and chroma-safe outputs where available so postproduction can compose over demos. Apply policy-first identity governance: no clone generation without verifiable consent evidence and revocation path. On failures, classify 429, 5xx, policy blocks, and sync errors separately, retry with bounded backoff, and switch providers without breaking artifact schema. The presenter layer succeeds only when downstream postproduction receives deterministic clip paths, checksums, and confidence metrics with zero field-name ambiguity.

## When to use

- Need avatar presenter videos from script plus approved voice stems
- Need lip-sync drift correction for pre-generated TTS audio
- Need multilingual avatar outputs EN UK PL with term locks
- Need same presenter identity across episode series
- Need alpha-safe or chroma-safe presenter clip exports
- Need fallback routing between HeyGen Synthesia D-ID Tavus
- Need policy-compliant face and voice cloning workflows
- Need per-scene presenter metadata for FFmpeg assembly
- Need dual-speaker turn-taking with deterministic cuts
- Need objective QC thresholds for trust-critical explainers

## Instructions

1. Pattern: compile one AvatarRenderJob per scene plus language before API calls -> deterministic retries and stable artifact paths.
2. Pattern: lock input_audio_uri and transcript_uri hashes pre-render -> prevents silent drift from upstream edits.
3. Pattern: measure lip_sync_drift_ms against word timestamps after every render -> objective go or rerender decision.
4. Pattern: apply same_avatar_all_languages as default policy -> stronger presenter identity continuity across channels.
5. Pattern: enforce terminology_lock_map before subtitle and transcript injection -> technical terms remain correct in speech and captions.
6. Pattern: route code-dense scenes to pip_layout presets with reduced gesture intensity -> lowers uncanny artifacts during proof segments.
7. Pattern: export mp4 plus sidecar json plus sha256 for every scene -> postproduction gets reproducible contracts.
8. Pattern: on 429 use quota-aware backoff before provider switch -> avoids cascading throttling and unnecessary cost.
9. Pattern: on policy_block redact or transform only blocked segment -> preserves remaining scene timing and manifests.
10. Pattern: cache reusable intro and outro presenter segments by checksum -> accelerates 12-video batch calendars without schema drift.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://ai_avatar_presenter_specialist`).
