---
name: devops-tiktok-live-ingest-guru
description: TikTok RTMP stream key. TikTok Live Producer or LIVE Center stream settings. external encoder TikTok HELO OBS nginx push. TikTok LIVE eligibility RTMP not showing. LegioX truth lens skill.
---

# DevOps TikTok Live Ingest Guru

## Summary

TikTok LIVE ingest for Ringdom restreamer stacks is a product-gated pipeline: operators must confirm in the current TikTok app or web LIVE flow whether **external RTMP** (Server URL + Stream Key, sometimes labeled Cast on PC / stream settings) exists for that account and market before wiring **nginx-rtmp `push`** targets. Official **TikTok LIVE Studio** documentation emphasizes hardware suitability (720p/30 minimum tier vs 1080p/60 recommended), **hardware encoders when supported**, built-in **speed test** for bitrate/resolution choice, and that **frame drops during LIVE** usually indicate **network or bitrate mismatch**—not nginx tuning. Anti-patterns: promising every creator an RTMP key from follower count alone, baking blog **live-api** hostnames into infra without UI verification, running unattended static loops contrary to real-time interactive LIVE expectations, and duplicating full nginx-rtmp Kubernetes relay tutorials here instead of **devops_nginx_rtmp_restreaming_proxy_guru**.

## When to use

- TikTok RTMP stream key
- TikTok Live Producer or LIVE Center stream settings
- external encoder TikTok HELO OBS nginx push
- TikTok LIVE eligibility RTMP not showing
- TikTok LIVE Studio bitrate resolution frame drops
- simulcast to TikTok from self-hosted restreamer

## Instructions

1. Pattern: eligibility → confirm RTMP/cast option in TikTok UI → copy Server URL + Stream Key into Secret → single test push from nginx-rtmp → only then add TikTok to production push list.
2. Pattern: on frame drops or viewer lag, lower bitrate or resolution per LIVE Studio troubleshooting guidance before scaling Kubernetes egress or nginx workers.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_tiktok_live_ingest_guru`).
