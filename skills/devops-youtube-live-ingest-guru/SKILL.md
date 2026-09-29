---
name: devops-youtube-live-ingest-guru
description: YouTube Live RTMP or RTMPS ingest URL and stream key setup. YouTube stream key rotation or reuse from Live Control Room. long running YouTube stream archival, end stream, or 12-hour archive behavior. nginx push to YouTube or restreamer fan-out targeting YouTube only. LegioX truth lens skill.
---

# DevOps YouTube Live Ingest Guru

## Summary

YouTube Live accepts RTMP and RTMPS per official Help; creators obtain Stream URL and stream key from Live Control Room (RTMPS via lock icon next to Stream URL). Encoder requirements include H.264 (or HEVC/AV1 per table), AAC or MP3 audio, CBR, keyframe 2s (max 4s), stereo AAC 128 kbps typical, 44.1 kHz stereo or 48 kHz for 5.1 AAC in RTMP/RTMPS. Recommended H.264 bitrates are tiered by resolution (e.g. 1080p30 10 Mbps, 1080p60 12 Mbps per Help table). The Live API liveStream resource exposes cdn.ingestionInfo.ingestionAddress, backupIngestionAddress, rtmpsIngestionAddress, rtmpsBackupIngestionAddress and streamName; health lives under status.healthStatus (good/ok/bad/noData) with configurationIssues for diagnosis. nginx-rtmp push to YouTube is valid at the transport layer but must use the current URL and key from the control room, never commit keys, and avoid duplicate simultaneous publishers using the same stream key from unrelated processes. Cross-reference devops_nginx_rtmp_restreaming_proxy_guru for Kubernetes exposure, HLS packaging to viewers, and relay process limits—not for YouTube bitrate policy.

## When to use

- YouTube Live RTMP or RTMPS ingest URL and stream key setup
- YouTube stream key rotation or reuse from Live Control Room
- long running YouTube stream archival, end stream, or 12-hour archive behavior
- nginx push to YouTube or restreamer fan-out targeting YouTube only
- YouTube Live encoder bitrate resolution H.264 HEVC AV1 table
- YouTube stream health configurationIssues or healthStatus bad/ok
- Live API liveStreams ingestionInfo rtmps backup dual ingest
- RTMPS SSL errors port 443 SNI troubleshooting for YouTube

## Instructions

1. Pattern: map YouTube symptom → Live Control Room stream health and official error doc → adjust encoder to Help table (CBR, GOP, codec) → if relayed, confirm single publisher and correct push URL from current stream key.
2. Pattern: for automation, liveStreams.insert → read cdn.ingestionInfo.{rtmpsIngestionAddress,rtmpsBackupIngestionAddress,streamName} → concatenate STREAM_URL/STREAM_NAME as documented → poll status.healthStatus.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_youtube_live_ingest_guru`).
