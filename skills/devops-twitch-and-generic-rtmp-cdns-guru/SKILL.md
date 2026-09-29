---
name: devops-twitch-and-generic-rtmp-cdns-guru
description: "Twitch RTMP ingest server choice or URL format"
disable-model-invocation: true
---
# DevOps Twitch & Generic RTMP CDN Ingest Guru

## Summary

Twitch ingestion is standardized around RTMP to a PoP-specific host with path `/app/` and the authorization stream key appended per the official URL form `rtmp://<ingest_server>/app/<stream_key>` (optional `?bandwidthtest=true` for Twitch Inspector), with the canonical list of `url_template` values returned by the unauthenticated `GET https://ingest.twitch.tv/ingests` API per Twitch’s video-broadcast reference—hardcoding historical `*.contribute.*` examples is an anti-pattern because templates evolve. LinkedIn Live custom RTMP is issued from Live Studio (Manage streams / Prepare to go live) with documented windows for URL+key generation, supports RTMP and RTMPS, and publishes concrete encoder recommendations (720p recommended, 1080p max, 30 fps, 2 s keyframe, H.264/AAC, 3.5 Mbps video recommended / 6 Mbps max, 128 kbps audio, 48 kHz) plus a troubleshooting tip to prefer H.264 Baseline when ingest fails. Generic RTMP CDNs almost always decompose to scheme, host, port, application path, and stream name/key; conflating application name with stream key or omitting RTMPS stunnel when the CDN requires TLS are common failure modes best validated with a short test publish before simulcast.

## Instructions

1. Pattern: `curl -sS https://ingest.twitch.tv/ingests | jq` → pick `url_template` → substitute `{stream_key}` or concatenate per nginx `push` semantics → validate with Twitch Inspector using `bandwidthtest=true` when appropriate.
2. Pattern: generic CDN → split `rtmp(s)://host:port/<app>/<stream>` → map `<app>` to nginx `application` name only when publishing TO self; when pushing OUT, pass provider’s full path and key exactly as their UI shows.
3. Pattern: LinkedIn scheduled event → open Manage streams in Live Studio → Prepare to go live in the documented time window → region + Get URL → encoder RTMP URL + key → preview before clicking Go live.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/devops-twitch-and-generic-rtmp-cdns-guru.nodus.json"`
