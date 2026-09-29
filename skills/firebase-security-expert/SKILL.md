---
name: firebase-security-expert
description: Firestore security rules. Firebase injection attacks. Cloud Functions security. Firebase Auth hardening. LegioX truth lens skill.
---

# Firebase Security Expert

## Summary

Firebase-specific attack surface security: Firestore rule bypasses, RTDB injection, Cloud Functions privilege escalation, Auth token manipulation. Security patterns must work across BackendSelector modes (firebase-full, k8s-postgres-fcm, supabase-fcm).

## When to use

- Firestore security rules
- Firebase injection attacks
- Cloud Functions security
- Firebase Auth hardening
- Firebase security during backend migration

## Instructions

1. Firestore rules: field-level validation, request.auth verification, resource.data comparison
2. Firebase injection prevention: path sanitization, query parameter validation
3. Cross-backend: rules translate to PostgreSQL RLS policies

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://firebase_security_expert`).
