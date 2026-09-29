---
name: devops-meta-graph-live-video-api-guru
description: Graph API live video. Facebook scheduled live API. Page access token live streaming. secure_stream_url. LegioX truth lens skill.
---

# DevOps Meta Graph Live Video API Guru

## Summary

Meta’s Live Video model is object-centric: POST to `/{page-id}/live_videos` or `/{user-id}/live_videos` (or `me/live_videos`) creates a LiveVideo node and returns `id`, `stream_url`, `secure_stream_url`, and optionally backup or DASH ingest fields per Graph API reference. Page operations require a Page access token with `pages_read_engagement` and `pages_manage_posts`; user profile uses `publish_video`. Scheduling uses `status=SCHEDULED_UNPUBLISHED` with `event_params` carrying a planned start (Meta scheduling guide: up to seven days ahead); encoder can send data before wall-clock start for preview, while feed visibility follows Meta rules. Operational anti-patterns: polling `ingest_streams` faster than every two seconds; using deprecated `published` instead of `status`; treating `secure_stream_url` like a static nginx upstream without storing per-LiveVideo credentials; ignoring June 2024 eligibility (Facebook account age and Page follower minimums documented on Meta developer pages). Encoder bitrate, CBR, keyframes, and RTMPS tuning belong in devops_meta_facebook_instagram_live_ingest_guru; nginx-rtmp relay topology belongs in devops_nginx_rtmp_restreaming_proxy_guru. For TV stations splitting always-on cable/web output from rights-cleared hourly social segments, drive Facebook from scheduled `LiveVideo` objects while keeping YouTube and other destinations on separate automation paths—never assume one API policy fits all platforms.

## When to use

- Graph API live video
- Facebook scheduled live API
- Page access token live streaming
- secure_stream_url
- POST page live_videos LIVE_NOW
- SCHEDULED_UNPUBLISHED event_params
- end_live_video Graph API
- ingest_streams stream_health polling
- Live Video API App Review permissions
- hourly scheduled news broadcast Facebook Page

## Instructions

1. Pattern: Page admin obtains long-lived Page access token with pages_read_engagement + pages_manage_posts → POST https://graph.facebook.com/v{VERSION}/{PAGE_ID}/live_videos?status=LIVE_NOW&title=…&description=… → capture id and secure_stream_url → feed encoder or nginx push → poll GET /{LIVE_VIDEO_ID}?fields=ingest_streams ≤1/2s → POST …?end_live_video=true when off-air.
2. Pattern: hourly authentic segment → POST …/live_videos?status=SCHEDULED_UNPUBLISHED&event_params={unix_start} (and title/description) → store LiveVideo id → automation starts RTMPS ingest before start_time → optional frame-accurate go-live only if product needs inband signal per streaming guide.
3. Pattern: on Graph error 200 with subcodes 1363120/1363144, eligibility failure (account age or follower minimum per Meta docs)—surface ops alert, do not retry blindly.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_meta_graph_live_video_api_guru`).
