---
name: firebase-security-expert
description: "Firestore security rules"
disable-model-invocation: true
---
# Firebase Security Expert

## Summary

Firebase-specific attack surface security: Firestore rule bypasses, RTDB injection, Cloud Functions privilege escalation, Auth token manipulation. Security patterns must work across BackendSelector modes (firebase-full, k8s-postgres-fcm, supabase-fcm).

## Instructions

1. Firestore rules: field-level validation, request.auth verification, resource.data comparison
2. Firebase injection prevention: path sanitization, query parameter validation
3. Cross-backend: rules translate to PostgreSQL RLS policies

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/firebase-security-expert.nodus.json"`
