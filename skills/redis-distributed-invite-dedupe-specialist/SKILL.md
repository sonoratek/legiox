---
name: redis-distributed-invite-dedupe-specialist
description: "Redis invite dedupe multi-pod"
disable-model-invocation: true
---
# Redis Distributed Invite Dedupe Specialist

## Summary

Ring P0 residual #3: process-local invite dedupe allows multi-pod double-challenge. Upgrade to Redis: SET peer-game:invite:{minUser}:{maxUser}:{slug} {inviteId|ts} NX PX {cooldownMs} OR directional peer-game:invite:{from}:{to}:{slug} if one-way cooldown is intended. Prefer SET with NX+PX in one command (Redis 2.6.12+); never SETNX+EXPIRE. For pure dedupe cooldown (not a held lock during work), NX success means 'challenge reserved for TTL' — no Lua release required unless you clear early on accept/reject. Prod recommendation: fail-closed for spammy clients when Redis is required in multi-replica; fail-open only if product prefers availability over strict dedupe and rate limits exist elsewhere. Local/dev without REDIS_URL: keep Map. Anti-patterns: unbounded keys; no TTL; process Map in multi-pod prod; marking dedupe before invite succeeds.

## Instructions

1. After successful createInvite: redis.set(key, inviteId, 'NX', 'PX', cooldownMs); if not OK another pod won the window — return already-challenged.
2. Pre-check optional GET/EXISTS for fast UX; authoritative gate is SET NX after success or before create with careful rollback.
3. Canonical key: peer-game:invite:{fromUserId}:{toUserId}:{slug} with fixed TTL (e.g. 60–300s).
4. Health: ping Redis on readiness; surface dedupe_backend=redis|memory in diagnostics.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/redis-distributed-invite-dedupe-specialist.nodus.json"`
