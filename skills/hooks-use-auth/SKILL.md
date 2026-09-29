---
name: hooks-use-auth
description: client logout or sign out button. role check in client component. KYC status navigation. migrating useSession-only auth to typed AuthUser. LegioX truth lens skill.
---

# Ring hooks/use-auth SSOT

## Summary

File hooks/use-auth.ts ('use client'). Export useAuth() only. Session from useSession(); user mapped to AuthUser with resolveSessionUserRole. signOut: await unregisterCurrentDeviceFcmToken() then nextAuthSignOut(options). Forbidden in UI: import { signOut } from 'next-auth/react'. Allowed server-only: export { signOut } from auth.ts for route handlers. Pair with useSession only when update() needed alongside useAuth (e.g. profile refresh). Kebab filename use-auth.ts matches hooks/use-wallet-actions.ts convention.

## When to use

- client logout or sign out button
- role check in client component
- KYC status navigation
- migrating useSession-only auth to typed AuthUser
- FCM token cleanup on session end
- auditing next-auth/react imports

## Instructions

1. SSOT_SIGNOUT — useAuth().signOut(); never next-auth/react signOut in components
2. FCM_PRE_LOGOUT — unregisterCurrentDeviceFcmToken before signOut
3. HAS_ROLE — hasRole(UserRole.member) via hasRoleAtLeast
4. AUTH_STATUS_NAV — navigateToAuthStatus(action, status, { returnTo })
5. KEBAB_FILE — hooks/use-auth.ts export useAuth

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://hooks_use_auth`).
