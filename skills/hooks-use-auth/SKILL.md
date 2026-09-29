---
name: hooks-use-auth
description: "client logout or sign out button"
disable-model-invocation: true
---
# Ring hooks/use-auth SSOT

## Summary

File hooks/use-auth.ts ('use client'). Export useAuth() only. Session from useSession(); user mapped to AuthUser with resolveSessionUserRole. signOut: await unregisterCurrentDeviceFcmToken() then nextAuthSignOut(options). Forbidden in UI: import { signOut } from 'next-auth/react'. Allowed server-only: export { signOut } from auth.ts for route handlers. Pair with useSession only when update() needed alongside useAuth (e.g. profile refresh). Kebab filename use-auth.ts matches hooks/use-wallet-actions.ts convention.

## Instructions

1. SSOT_SIGNOUT — useAuth().signOut(); never next-auth/react signOut in components
2. FCM_PRE_LOGOUT — unregisterCurrentDeviceFcmToken before signOut
3. HAS_ROLE — hasRole(UserRole.member) via hasRoleAtLeast
4. AUTH_STATUS_NAV — navigateToAuthStatus(action, status, { returnTo })
5. KEBAB_FILE — hooks/use-auth.ts export useAuth

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/hooks-use-auth.nodus.json"`
