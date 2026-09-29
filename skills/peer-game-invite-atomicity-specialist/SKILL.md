---
name: peer-game-invite-atomicity-specialist
description: "orphan peer_game_sessions after createInvite"
disable-model-invocation: true
---
# Peer Game Invite Atomicity Specialist

## Summary

Ring P0 residual #2: createInvite in features/peer-games/service.ts creates the session document/SQL row before sendMessage for interactive game_request. That ordering prevents inviting without a session, but leaves an orphan window if the process dies between create and send, or if send fails after create (P0 already deletes on send failure — harden and cover crash). Prefer a single Postgres transaction when both session and message live on the same SQL connection; when chat messages remain document/JSONB on a different path, keep compensating delete + outbox/saga. Always set messageId on the session after successful send. Orphan reaper: status=pending AND (message_id IS NULL OR updated_at < now()-invite_ttl) → mark expired/cancelled and notify if needed. Idempotency: accept client inviteId or hash(from,to,slug,window) so retries do not double-insert. Anti-patterns: trusting in-memory only; no TTL; linking message before session exists (reverted P0 flaw).

## Instructions

1. Write order: create session (pending) → send game_request → update session.messageId; on send fail → delete session.
2. When both writes share Postgres: BEGIN; insert session; insert message; update session; COMMIT — else compensating saga.
3. Reaper job: SELECT id FROM peer_game_sessions WHERE status='pending' AND (message_id IS NULL OR updated_at < now() - interval '15 minutes').
4. Idempotency: store inviteId unique constraint or Redis/SQL unique on (inviter, invitee, slug, bucket).

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/peer-game-invite-atomicity-specialist.nodus.json"`
