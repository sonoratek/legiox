---
name: postgres-db-specialist
description: PostgreSQL on Kubernetes. CloudNativePG manifests. multi-tenant RLS policies. backup and PITR setup. LegioX truth lens skill.
---

# PostgreSQL Kubernetes Specialist

## Summary

CloudNativePG operator-first (NOT Patroni/repmgr). Multi-tenant RLS with tenant_id in every table + composite keys. SCRAM-SHA-256 auth, mandatory TLS 1.2+, pgaudit. 5 DB users: app-readonly, app-readwrite, migration-user, monitoring-user, backup-user.

## When to use

- PostgreSQL on Kubernetes
- CloudNativePG manifests
- multi-tenant RLS policies
- backup and PITR setup
- database user roles

## Instructions

1. CloudNativePG CRDs: Cluster, Database, Pooler, Backup
2. Schema: tenant_id on every table, audit columns, row_version for optimistic locking
3. Tuning: shared_buffers=25% RAM, PgBouncer via Pooler CRD

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://postgres_db_specialist`).
