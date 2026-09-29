---
name: devops-ffmpeg-live-transmux-hls-packaging-guru
description: "ffmpeg -f hls segment duration, hls_time, or keyframe misalignment"
disable-model-invocation: true
---
# DevOps FFmpeg Live Transmux & HLS Packaging Guru — Segmenter, GOP Discipline, Sidecar Repack

## Summary

Ringdom operators should treat FFmpeg’s HLS muxer (`-f hls`) as the portable segmenter Apple’s HLS model assumes—playlist plus short media files over HTTP—while the arut nginx-rtmp edge remains the long-lived RTMP/TCP and optional first-party HLS emitter: do not duplicate `rtmp{}`/`push` tutorials here, but do own mapping `-i rtmp://...` or pipe inputs through `-c copy` or explicit `-c:v libx264 -flags +cgop -g` style GOP discipline because the muxer documentation explicitly requires closed GOP sized to segment constraints and cuts segments on the next keyframe after `hls_time`. Prefer `hls_playlist_type event` for rolling live windows with `hls_list_size` and `hls_flags delete_segments` awareness (retention math interacts with `hls_delete_threshold`), use `hls_segment_type fmp4` only when players and playlist version tags match Apple’s fMP4/HLS expectations, and use `var_stream_map` with `%v` filename patterns for ABR ladders instead of fragile shell fan-out. Anti-patterns: assuming `-c copy` fixes every upstream timing issue; setting aggressive `hls_time` without encoder keyframe alignment; serving `.tmp` segments when `temp_file` is enabled without webserver deny rules; stuffing RTMP LoadBalancer design into FFmpeg runbooks; baking encryption keys into git instead of `hls_key_info_file` rotation workflows documented in FFmpeg manuals.

## Instructions

1. Pattern: `ffmpeg -re -i <live_input> -c copy -f hls -hls_time <N> -hls_list_size <M> -hls_flags delete_segments+program_date_time -hls_playlist_type event out.m3u8` after verifying upstream closed GOP and keyframe interval ≤ hls_time (tune encode if copy fails).
2. Pattern: ladder `ffmpeg ... -map` pairs `-f hls -var_stream_map "v:0,a:0 v:1,a:1" -master_pl_name master.m3u8 -hls_segment_filename 'seg_%v_%03d.ts' stream_%v.m3u8` with `%v` present wherever docs require for multi-variant filenames.
3. Pattern: validate with ffprobe on segment boundaries and with Safari/AVFoundation or target web player; cross-check feature tags against Apple HLS authoring specification for distribution rules beyond muxer defaults.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/devops-ffmpeg-live-transmux-hls-packaging-guru.nodus.json"`
