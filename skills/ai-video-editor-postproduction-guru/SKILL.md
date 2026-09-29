---
name: ai-video-editor-postproduction-guru
description: "Need deterministic timeline assembly from scene manifests and dub stems"
disable-model-invocation: true
---
# AI Video Editor & Post-Production Guru (NODUS)

## Summary

Post-production is the convergence layer where upstream truth becomes public reality, so deterministic assembly beats ad-hoc timeline editing every time. Ingest upstream contracts without mutating semantic keys, resolve duration and sync mismatches via explicit conform policy, and keep timeline decisions reproducible in JSON rather than hidden in GUI state. Use FFmpeg for heavy mux/transcode/conform/QC primitives and Remotion for deterministic overlays and code-accurate motion graphics, then enforce objective go/no-go gates before export. Treat captions as editorial assets with measurable readability standards and language-safe terminology handling, not afterthought burn-ins. Maintain brand consistency through calibrated color normalization and anti-overprocessing heuristics for synthetic clips. Final delivery must include checksums, render fingerprints, and lineage links from each export variant back to script scene IDs, generation job IDs, and voice timestamp artifacts so any issue can be traced and rerendered surgically.

## Instructions

1. Pattern: validate all upstream manifests before timeline build -> prevents late-stage cascade failures.
2. Pattern: freeze canonical scene order from script scene_id sequence -> preserves narrative and chapter intent.
3. Pattern: insert transitions only at policy-approved boundaries -> avoids arbitrary pacing drift.
4. Pattern: resolve duration mismatch via explicit conform ladder -> keeps sync deterministic across reruns.
5. Pattern: render overlays in Remotion and finishing in FFmpeg -> balances precision and throughput.
6. Pattern: run subtitle readability checks before burn-in decisions -> reduces platform rejection and churn.
7. Pattern: normalize color and denoise before upscale/sharpen -> minimizes synthetic artifact amplification.
8. Pattern: perform two-pass loudness conform after final mix -> stabilizes cross-platform playback.
9. Pattern: classify QC findings into blocker warning info -> creates deterministic go/no-go decisions.
10. Pattern: emit manifest checksums and lineage for each export -> enables reproducible forensic rerender.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ai-video-editor-postproduction-guru.nodus.json"`
