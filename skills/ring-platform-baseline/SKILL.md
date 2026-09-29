---
name: ring-platform-baseline
description: "form handling with useActionState"
disable-model-invocation: true
---
# Ring Platform Baseline

## Summary

Server Components are default - 'use client' is exception. React Compiler v1.0.0 eliminates manual useMemo/useCallback. useActionState replaces useReducer for forms. Server Actions ('use server') replace API routes for mutations. Ring actions at app/_actions/ and features/*/services/. React.cache() wraps SSOT read helpers in firebase-service-manager.ts for server-side request deduplication (3-7x reduction in Firestore reads per request). React 19 use() unwraps Promises in client components — paired with <Suspense> for declarative loading. The use-firebase hook family (planned) wraps firebase/app + firebase/firestore + firebase/auth for client-side React 19 + Firebase integration; use-fcm.ts is the established reference pattern. Tunnel (lib/tunnel) is the canonical real-time transport — Firebase RTDB is NOT used in Ring Platform.

## Instructions

1. Server Actions with 'use server' for all mutations
2. useActionState + useOptimistic for forms
3. React Compiler: automatic memoization
4. Strategic 'use client' islands in Server Component trees
5. React.cache() wraps every getCachedXxx SSOT helper in firebase-service-manager.ts — automatic request-deduplication within a request cycle (3-7x Firestore read reduction)
6. React 19 use() unwraps Promises in client components — 3-variant pattern from use-credit-balance.ts: useCreditBalance (regular), useCreditBalancePromise (returns Promise for use()), useCreditBalanceWithSuspense (direct use() + <Suspense>)
7. use-firebase hook family (planned for hooks/use-firebase.ts): useFirebaseApp + useFirestore + useFirebaseAuth + useFirestoreDoc + useFirestoreCollection + useFirestoreCache — all 'use client' + typeof window guard + lazy init + React 19 use() + Suspense
8. useFirestoreCache(ssotFn) hybrid pattern: Server Component ships initial data via getCachedXxx (firebase-service-manager); Client Component subscribes to live updates via Firestore onSnapshot — best of SSOT consistency + real-time reactivity
9. use-fcm.ts as the established reference for use-firebase: 'use client' + dynamic import of firebase/messaging + getToken + onMessage + Server Action upsertFcmToken + deviceFingerprint localStorage + React 19 use() via FCMProvider
10. use-tunnel-channel.ts: useTunnel() context + useEffect + ref pattern for stable callbacks (prevents re-subscription loops) — the canonical real-time pattern; Tunnel replaces Firebase RTDB
11. useFormStatus for form button pending state (must be called in a component rendered INSIDE <form>)
12. useTransition for non-blocking async transitions (e.g. search-as-you-type, tab switching)
13. useDeferredValue for deferring non-urgent updates (e.g. search results filtering, charts)
14. useSyncExternalStore for external data sources (Tunnel subscriptions, Firestore onSnapshot, WebSocket)

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/react-19-specialist.nodus.json"`
