---
name: ai-video-generation-orchestrator
description: "Runway textToVideo imageToVideo task polling waitForTaskOutput"
disable-model-invocation: true
---
# AI Video Generation Orchestrator (NODUS)

## Summary

Treat RingdomVideoScriptBundle from the scriptwriter lens as immutable input: orchestration adds job_id, idempotency_key, provider payloads, and artifact URIs only. Route text_to_video to cinematic B-roll when diagram_type is none and negatives forbid UI text; never send long code listings to T2V—use diagram_type remotion_comp or screen_capture for jq, JSON schema, and terminal truth. Merge production_brief.brand.reference_image_uri with scene.reference_image_uri by preferring scene override then brief; concatenate b_roll_negative_prompt with brand.negative_prompt_global. Enforce cost caps per scene and per script via budget_usd_max on VideoGenerationJob; on overrun downgrade model (e.g. gen4.5→gen4_turbo) or shorten segment_seconds toward provider max. Idempotency: same idempotency_key must no-op duplicate charges where providers support it—else dedupe in your store. Poll or webhook until SUCCEEDED or terminal FAILED; persist attempts and last_error for LegioX dashboards. Concat with FFmpeg concat demuxer after normalizing fps and SAR; if TTS duration exceeds video, extend last frame or loop subtle B-roll rather than accelerating speech. Anti-patterns: redefining script_json_schema; trusting generative video for readable IDE fonts; skipping loudness pass on mixed voice+music; ignoring 429 backoff tables.

## Instructions

1. Pattern: scene.diagram_type in mermaid|svg|remotion_comp|screen_capture → skip T2V for that scene; render truth locally → MP4.
2. Pattern: idempotency_key = sha256(script_id + scene_id + provider + model + normalized_payload) → dedupe jobs across worker restarts.
3. Pattern: negative_prompt_effective = join(global, scene.b_roll_negative_prompt, "no readable text, no subtitles burned in") for gen B-roll.
4. Pattern: reference_image_effective = scene.reference_image_uri ?? production_brief.brand.reference_image_uri → I2V anchor.
5. Pattern: on 429 → exponential backoff with jitter cap 120s; rotate to fallback_provider row after N tries.
6. Pattern: concat only after ffprobe confirms uniform fps or fps filter applied per clip.
7. Pattern: voice longer than video → tpad=clone or apad + video freeze last frame; never drop narration.
8. Pattern: manifest.json lists scene_order, path, duration_seconds_measured, provider—single source for FFmpeg and audit.
9. Pattern: budget exceeded → shorten duration toward provider.min_seconds or swap model per cost_latency_budget_router.
10. Pattern: Blender MCP only when scene metadata requests 3D explicit brief—never default for explainers.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ai-video-generation-orchestrator.nodus.json"`
