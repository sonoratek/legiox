---
name: devops-simulcast-and-restream-operations-guru
description: "simulcast bandwidth"
disable-model-invocation: true
---
# DevOps Simulcast & Restream Operations Guru

## Summary

Simulcast operations are a capacity and change-management problem more than a second encoding: with a single ingest to a relay, encoder uplink stays near one times the video+audio bitrate while the relay’s outbound bandwidth scales roughly with the number of simultaneous RTMP push legs at comparable bitrates—model both and add headroom for jitter. Staged rollout (one destination at a time), explicit platform matrix ownership, and per-leg observability separate “Facebook rejected key” from “origin saturated egress” from “HELO dropped frames.” Stream keys and RTMPS endpoints belong in secrets and platform ingest lenses, not duplicated here; nginx-rtmp directive mechanics and Kubernetes 1935 exposure stay in devops_nginx_rtmp_restreaming_proxy_guru. Anti-patterns: sizing only encoder upload while ignoring origin egress; rotating every platform key in one incident; using a single shared alert for all legs so one flap pages the whole org; committing keys to git; assuming all platforms accept the same GOP without checking their ingest lens.

## Instructions

1. Pattern: capacity_sheet → encoder_uplink_mbps + origin_egress_mbps ≈ bitrate × N_legs (+ headroom) → compare to host NIC and cloud egress cap → only then add push lines in nginx-rtmp or relay config.
2. Pattern: incident triage → classify leg failure (DNS/TLS/auth/bitrate) using per-push logs and upstream status pages → toggle single push or key → leave ingest and other legs untouched.
3. Pattern: runbook_add_destination → dry-run URL from inside cluster → add push with canary bitrate or test key → monitor 15–30 min → promote to production key in Secret → document in platform_matrix_template.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/devops-simulcast-and-restream-operations-guru.nodus.json"`
