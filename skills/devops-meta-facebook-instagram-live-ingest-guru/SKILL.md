---
name: devops-meta-facebook-instagram-live-ingest-guru
description: "Facebook Live RTMPS encoder settings or rejection"
disable-model-invocation: true
---
# DevOps Meta Facebook & Instagram Live Ingest Guru

## Summary

Meta Facebook Live is contractually RTMPS with H.264 and AAC-LC only, CBR video, progressive 16:9 where possible, stereo AAC at 44.1 or 48 kHz and 128–256 kbps audio, H.264 level 4.1 up to 1080p30 and level 4.2 for 1080p60, two-to-four-second keyframe policy, and an eight-hour maximum live length per published business help; Live Producer streaming-software flows expose a stream key valid for the current stream and impose account age and follower gates (60-day account, 100 followers on Page or professional profile) with a documented multi-hour window to complete go-live after the encoder connects. Live Video API returns secure_stream_url values typically on rtmps://rtmp-api.facebook.com hosts and reports stream health including GOP size in milliseconds; ingest may be considered unhealthy after a few seconds without data—operators must not assume infinite silent gaps. Instagram Live via external encoders relies on desktop creator flows with per-session stream URL and key material that is not interchangeable with unattended 24/7 static nginx push without human or API rotation; never store keys in git, and for Ring tv.* style restreamers terminate RTMPS per devops_nginx_rtmp_restreaming_proxy_guru rather than duplicating full nginx directive tutorials here.

## Instructions

1. Pattern: pull official bitrate + codec row from meta_facebook_live_technical_spec → configure encoder CBR + GOP → obtain Live Producer server URL + stream key OR Graph secure_stream_url → hand to nginx-rtmp push as single quoted URL with embedded path.
2. Pattern: on Meta stream failure, read Live Video API errors field (when using API) or Live Producer troubleshooting help article before retuning bitrate; distinguish network drop from copyright or privacy blocks.
3. Pattern: for Instagram third-party live, schedule human steps to refresh stream key each session; do not treat Instagram like Facebook static Page RTMP for unmanned 24/7 unless product explicitly supports it after verification.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/devops-meta-facebook-instagram-live-ingest-guru.nodus.json"`
