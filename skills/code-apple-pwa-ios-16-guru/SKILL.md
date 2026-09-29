---
name: code-apple-pwa-ios-16-guru
description: "iOS Safari white screen or WSOD on production"
disable-model-invocation: true
---
# Apple PWA iOS 16+ Guru

## Summary

On iOS, Web Push is NOT a Safari-tab feature — it ships for Home Screen web apps starting iOS/iPadOS 16.4 (WebKit blog 13878). In Safari tabs, PushManager is absent and the Notification global is often undefined; code that reads Notification.permission without `'Notification' in window` throws ReferenceError and can white-screen React apps mounted globally (e.g. FCMProvider). macOS Safari 16.1+ supports standards-based Web Push in browser tabs. Home Screen web apps require HTTPS, a manifest with display standalone or fullscreen, service worker registration, user-gesture permission prompts, and VAPID-identified pushes to APNs (*.push.apple.com). Safari/WebKit forbids silent push: show a user-visible notification immediately when a push arrives or permission/subscription may be revoked. iOS 18.4 adds Declarative Web Push for Home Screen web apps (window.pushManager, declarative JSON payload, SW optional for display). Without a qualifying manifest, Add to Home Screen creates a bookmark that opens in the default browser (iOS 16.4+), not a standalone web app — push APIs remain unavailable. Ring clones must treat push as progressive enhancement: guard every Notification/PushManager touch, lazy-init Firebase for FCM only, and never block app shell on missing push APIs.

## Instructions

1. IOS_TAB_NO_PUSH — Safari tab on iPhone/iPad does not expose Web Push; PushManager and often Notification are undefined. Never assume browser notification APIs exist on iOS.
2. HOME_SCREEN_ONLY_IOS — Web Push + Notifications API on iOS/iPadOS require the site added to Home Screen as a web app (manifest display: standalone | fullscreen), iOS 16.4+.
3. GUARD_NOTIFICATION_GLOBAL — Always `'Notification' in window` before Notification.permission, requestPermission(), or `new Notification()`. typeof window check alone is insufficient.
4. GUARD_PUSH_MANAGER — Use `'PushManager' in window` or ServiceWorkerRegistration.pushManager after SW register; false in Safari tab does not mean unsupported forever — user may need Install to Home Screen.
5. USER_GESTURE_PERMISSION — iOS requires notification permission request in direct response to user interaction (button tap), not on mount or setTimeout without recent gesture.
6. MANIFEST_STANDALONE — Web app manifest must set display to standalone or fullscreen; link rel=manifest in document; apple-touch-icon recommended. Without it, Home Screen icon is a bookmark, not a web app.
7. NO_SILENT_PUSH_WEBKIT — Service worker must call showNotification promptly on push; invisible/silent-only pushes are not supported; violations can revoke subscription.
8. APNS_VAPID_ENDPOINT — Server pushes use RFC8030 over HTTPS to subscription endpoint; VAPID JWT + public key; allow egress to https://*.push.apple.com; no Apple Developer Program required for web push.
9. MACOS_TAB_PUSH_OK — macOS Safari 16.1+ (Ventura+) supports Web Push in browser tabs — do not copy iOS-only guards into macOS-specific UX without feature detection.
10. DECLARATIVE_WEB_PUSH_18_4 — iOS/iPadOS 18.4+ Home Screen apps: window.pushManager.subscribe, push payload with web_push:8030 + notification object; SW optional for display; navigate URL on click.
11. RING_FCM_LAZY — k8s-postgres-fcm: Firebase client is FCM-only with lazy getFirebaseApp(); invalid API key must not throw on import. Push UX is optional; app shell must render without Notification API.
12. STANDALONE_DETECT — Detect installed PWA: window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true (legacy iOS). Use to show Install-for-push CTA vs Enable-notifications CTA.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/code-apple-pwa-ios-16-guru.nodus.json"`
