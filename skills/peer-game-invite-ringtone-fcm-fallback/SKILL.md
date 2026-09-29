---
name: peer-game-invite-ringtone-fcm-fallback
description: "FCM game invite Tunnel offline"
disable-model-invocation: true
---
# Peer Game Invite Ringtone FCM Fallback

## Summary

Ring P1 #9: when Tunnel offline, send FCM for GAME_REQUEST with deep link to conversation or /games session. If Tunnel online, IncomingGameBanner handles UX — suppress duplicate FCM or mark collapse_key. Ringtone: separate asset from call; play only after user gesture permission / notification click where autoplay blocked; default muted until preference enabled. Respect doNotDisturb and GAME_REQUEST opt-out. Mutex: ringtone does not mean callBusy; gameBusy still from session. iOS PWA/Android limits: background audio restricted — rely on FCM system sound. Anti-patterns: ringtone without prefs; Tunnel+FCM spam; treating game alert as WebRTC call.

## Instructions

1. Server: if recipient tunnel presence offline → fcm.send GAME_REQUEST.
2. Client SW: show notification; optional play game-ringtone.mp3 on click/foreground with pref.
3. Dedupe: same inviteId collapse key across FCM and in-app banner.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/peer-game-invite-ringtone-fcm-fallback.nodus.json"`
